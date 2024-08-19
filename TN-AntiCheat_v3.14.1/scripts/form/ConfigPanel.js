import * as UI from '@minecraft/server-ui';
import { ActionForm } from '../lib/form/ActionForm';
import { Util } from '../util/util';
import config from '../config.js';
import { Icons } from '../util/constants';
import { description } from '../util/config_description';
import { DataManager } from '../util/DataManager';
import { DROPDOWNS, confirmForm } from './static_form';
import { canAdd } from '../util/config_setting';

export class ConfigPanel {
  /**
   * @param {import('../ac').TNAntiCheat} ac 
   * @param {import('@minecraft/server').Player} player 
   * @param {boolean} [busy] 
   */
  constructor(ac, player, busy) {
    this.ac = ac;
    this.player = player;
    if (Util.isOP(player)) this.selectModule(busy).catch(e => console.error(e, e.stack));
  }
  
  async selectModule(busy, message) {
    let body = '編集したいConfigを選択してください';
    if (message) body = `§o${message}§r\n\n${body}`;
    const form = new ActionForm()
      .title('ConfigEditor')
      .body(body);
    const modules = Object.keys(config);
    for (const moduleName of modules) {
      const moduleData = config[moduleName];
      const color = moduleData.state ? '§2' : (moduleData.state === false) ? '§4' : '';
      const desc = description[moduleName]?.desc ? `\n§o§9${description[moduleName].desc}§r` : '';
      form.button(`${color}§l${moduleName}§r${desc}`, null, 'moduleName');
    }
    form.button('§l§c初期設定に戻す', Icons.reset, 'reset');
    const { selection, canceled, button } = busy
      ? await Util.showFormToBusy(this.player, form) // from chat
      : await form.show(this.player);
    if (canceled) return;
    
    if (button.id === 'reset') {
      const res = await confirmForm(this.player, {
        body: `全てのConfigを初期設定に戻しますか？`,
        yes: '§cリセットする',
        no: '§lキャンセル'
      });
      if (!res) return await this.selectModule();
      DataManager.resetAll();
      Util.notify('§a全ての設定をリセットしました', this.player);
      Util.writeLog({ type: 'config.resetAll', message: `全ての設定をリセットしました` }, this.player);
      return await this.selectModule(false, `§a全ての設定をリセットしました`);
    }
    const moduleName = modules[selection];
    const diff = {};
    const moduleData = Util.cloneObject(config[moduleName]);
    if (!moduleData) return Util.notify(`§cError: unexpected index`, this.player);
    const res = await this.selectValue(moduleData, moduleName, diff, {
      title: `config.${moduleName}`,
      isModule: true
    });
    if (res.edited) {
      DataManager.patch(config[moduleName], diff);
      DataManager.update(moduleName, diff);
    }
    if (res.reopen) await this.selectModule(false, res.message);
  }
  
  async selectValue(value, key, ref, { deletable = false, title, isModule = false }) {
    switch (typeof value) {
      case 'object': {
        const form = new ActionForm().title(title);
        
        if (value instanceof Array) {
          value.forEach(v => form.button(String(v)));
          form.button('§1値を追加する / Add value', Icons.plus);
          form.button('戻る / Return', Icons.returnBtn, 'return');
          const { canceled, selection, button } = await form.show(this.player);
          if (canceled) return { reopen: false };
          if (button.id === 'return') return { reopen: true };
          
          const res = await this.selectValue(value[selection], selection, value, {
            deletable: true,
            title: `${title}[${selection}]`
          });
          ref[key] = value.filter(Boolean);
          return res;// 配列から削除可
          
        } else {
          const keys = Object.keys(value);
          keys.forEach(k => form.button(`§0${k}\n§8${getPreview(value[k])}`));
          if (canAdd[title]) form.button('§1値を追加する / Add value', Icons.plus, 'add');
          if (isModule) {
            form.body(`${getDescription(key) ?? ''}\n `);
            form.button('§l§c初期設定に戻す', Icons.reset, 'reset');
          }
          form.button('戻る / Return', Icons.returnBtn, 'return');
          const { canceled, selection, button } = await form.show(this.player);
          if (canceled) return { reopen: false };
          if (button.id === 'return') return { reopen: true };
          if (button.id === 'reset') {
            const res = await confirmForm(this.player, {
              body: `${title} を初期設定に戻しますか？`,
              yes: '§cリセットする',
              no: '§lキャンセル'
            });
            if (!res) return { reopen: true };
            DataManager.reset(key);
            Util.writeLog({ type: 'config.edit', message: `§a${key} をリセットしました` }, this.player);
            return { reopen: true, message: `§a${key} をリセットしました` };
          }
          
          if (button.id === 'add') {
            const { key: _key, value: _value, message } = await this.addValue({ title, isNumber: canAdd[title].type === 'number' });
            if (message) return { reopen: true, message }; // not a number error
            if (!_value) return { reopen: true };
            value[_key] = _value;
            return { reopen: true, edited: true };
          }
          
          const newKey = keys[selection];
          const res = await this.selectValue(value[newKey], newKey, value, {
            title: `${title}.${newKey}`,
            deletable: !!canAdd[title]
          });
          if (res.edited) ref[newKey] = value[newKey];
          return res;
        }
      }
      case 'string': {
        return await this.editText(value, key, ref, { title, deletable });
      }
      case 'number': {
        return await this.editText(value, key, ref, { isNumber: true, title, deletable });
      }
      case 'boolean': {
        return await this.editToggle(value, key, ref, { title, deletable });
      }
      case 'undefined': {  // new value
        return await this.editText(value, key, ref, { add: true, title, deletable });
      }
      default:
        throw Error('unexpected type');
    }
  }
  
  async editText(value, key, ref, { add = false, isNumber = false, title, deletable = false }) {
    const showDelete = deletable && !add;
    const useDropdown = Object.keys(DROPDOWNS).includes(key);
    const form = new UI.ModalFormData().title(title);
    if (useDropdown) {
      form.dropdown(
        key,
        DROPDOWNS[key].map(x => `${x.value} §l§7${x.desc ?? ''}`),
        DROPDOWNS[key].findIndex(x => x.value === value)
      );
    } else {
      form.textField(
        typeof key === 'number' ? `[${key}]` : String(key),
        `[${add ? 'new value' : typeof value}]`,
        String(value ?? '')
      );
    }
    if (showDelete) form.toggle('§c値を削除する', false);
    const { canceled, formValues } = await form.show(this.player);
    if (canceled) return { reopen: true };
    
    const res = /** @type {string} */ (formValues[0]);
    let newValue = isNumber ? Number(res) : res;
    if (showDelete && formValues[1]) {
      newValue = undefined;
    
    // @ts-ignore
    } else if (isNumber && isNaN(newValue)) {
      return { reopen: true, message: `§cTypeError: 数字を入力してください` };
    }
    if (useDropdown) newValue = DROPDOWNS[key][newValue].value;
    
    const edited = value !== newValue;
    if (edited) {
      ref[key] = newValue;
      Util.notify(`§e${title} を §f${newValue} §eに設定しました`, this.player);
      Util.writeLog({ type: 'config.edit', message: `§e${title} を §f${newValue} §eに設定しました` }, this.player);
    }
    return { edited, reopen: true }
  }
  
  async editToggle(value, key, ref, { title, deletable }) {
    const form = new UI.ModalFormData().title(title);
    form.toggle(key, value);
    if (deletable) form.toggle('§c値を削除する', false);
    const { canceled, formValues } = await form.show(this.player);
    if (canceled) return { reopen: true };
    
    let newValue = formValues[0];
    if (deletable && formValues[1]) newValue = undefined;
    const edited = value !== newValue;
    if (edited) {
      ref[key] = newValue;
      Util.notify(`§e${title} を §f${newValue} §eに設定しました`, this.player);
      Util.writeLog({ type: 'config.edit', message: `§e${title} を §f${newValue} §eに設定しました` }, this.player);
    }
    return { edited, reopen: true }
  }
  
  async addValue({ isNumber, title }) {
    const form = new UI.ModalFormData().title(title + '[new key]');
    const settings = canAdd[title];
    if (!settings.key) form.textField(
      settings.keyDesc ? `key (${settings.keyDesc}):` : 'key',
      `[type: string]`
    );
    form.textField(
      (settings.key ? `key (${settings.keyDesc}): "${settings.key}"\n\n` : '') + (settings.valueDesc ? `value (${settings.valueDesc}):` : 'value'),
      `[type: ${settings.type ?? 'any'}]`
    );

    const { canceled, formValues } = await form.show(this.player);
    if (canceled) return { key: 'newKey' };
    let value = settings.key ? formValues[0] : formValues[1];
    let key = settings.key ? settings.key : formValues[0];
    
    if (isNumber) {
      value = Number(value);
      if (isNaN(value)) return { message: `§cTypeError: 数字を入力してください` };
    }
    Util.notify(`§e${title}.${key} を §f${value} §eに設定しました`, this.player);
    Util.writeLog({ type: 'config.edit', message: `§e${title}.${key} を §f${value} §eに設定しました` }, this.player);
    return { key, value }
  }
}


function getDescription(moduleName) {
  if (!description[moduleName]) return;
  const _module = description[moduleName];
  return Object.keys(description[moduleName])
    .map(k => k === 'desc' ? `§o§6${_module[k]}§r` : `- ${k}: ${_module[k]}§r`)
    .join('\n');
}

function getPreview(value) {
  if (['string', 'number', 'boolean'].includes(typeof value)) return String(value);
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === 'object') return `{ ${Object.keys(value).length} entries }`;
  return `[${typeof value}]`;
}
