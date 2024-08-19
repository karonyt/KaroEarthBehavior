import { GameMode, Player } from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { Icons, VERSION, DISCORD_URL } from '../util/constants';

export const FORMS = {
  main: new UI.ActionFormData()
    .title('TN-AntiCheat AdminPanel')
    .button('§lプレイヤーリスト / Player List', Icons.playerList) // 0
    .button('§lエンティティ数を表示 / Show Entities', Icons.entities) // 1
    .button('§l設定 / Config', Icons.config) // 2
    .button('§lログ / Logs', Icons.logs) // 3
    .button('§lUnbanリスト / Unban Queue', Icons.unbanQueue) // 4
    .button('§lこのアドオンについて / About', Icons.about), // 5
  playerInfo: new UI.ActionFormData()
    .title('PlayerInfo')
    .button('§lインベントリを表示 / Show Inventory', Icons.inventory)
    .button('§l権限を管理 / Manage Permissions', Icons.permission)
    .button('§lkickする / Kick', Icons.kick)
    .button('§lbanする / Ban', Icons.ban)
    .button('§lアビリティを管理 / Manage Abilities', Icons.ability)
    .button('§lテレポート / Teleport', Icons.teleport)
    .button('§l自分にテレポート / Teleport Here', Icons.teleportHere)
    .button('§lタグ一覧を表示 / Show Tags', Icons.tags)
    .button('§lスコア一覧を表示 / Show Scores', Icons.scores)
    .button('戻る / Return', Icons.returnBtn), // 9
  itemInfo: new UI.ActionFormData()
    .title('ItemInfo')
    .button('§l削除 / Clear\n§r§8インベントリからアイテムを削除します', Icons.clear)
    .button('§l転送 / Transfer\n§r§8アイテムを転送します', Icons.transfer)
    .button('§l名前を編集 / Edit NameTag')
    .button('§l説明文を編集 / Edit Lore')
    .button('戻る / Return', Icons.returnBtn),
  about: new UI.ActionFormData()
    .title('About')
    .body([
      `§l§aTN-AntiCheat v${VERSION}§r\n`,
      'ScriptAPIを使った軽量で使いやすいアンチチートアドオンです\n',
      '- ダウンロード: https://github.com/tutinoko2048/TNAntiCheat',
      `- §9Discordサポートサーバー:§r ${DISCORD_URL}`,
      '  §7(バグやbypassの報告・機能の提案などはこちらからどうぞ)§r',
      '- Developer: tutinoko2048 / RetoRuto9900K\n'
    ].join('\n'))
    .button('戻る / Return', Icons.returnBtn)
}

export const DROPDOWNS = {
  punishment: [
    { value: 'ban', desc: 'プレイヤーをBANします' },
    { value: 'kick', desc: 'プレイヤーをKickします' },
    { value: 'tempkick', desc: 'プレイヤーを切断します(再参加可能)' },
    { value: 'notify', desc: 'チャット欄に通知します' },
    { value: 'none', desc: '何もしません' }
  ],
  mode: [
    { value: 'hand', desc: '手持ちアイテムのオーバーエンチャントを検知' },
    { value: 'inventory', desc: 'インベントリ内全てのアイテムを検知' }
  ],
  defaultGamemode: Object.values(GameMode).map(value => {
    return { value }
  })
}

// returns yes -> true, no -> false
/** @param {Player} player */
export async function confirmForm(player, { title = '確認', body, yes = 'OK', no = '§lキャンセル', defaultValue = false }) {
  const form = new UI.MessageFormData();
  form.title(title)
    .body(body)
    .button1(no)
    .button2(yes);
  const { selection, canceled } = await form.show(player);
  if (canceled) return defaultValue;
  return selection === 1;
}

/**
 * 
 * @param {Player} player 
 * @param {{ label: string, placeholder: string, title?: string, defaultValue?: string, allowDelete?: boolean }} options
 * @returns {Promise<{ canceled: boolean, value: string, deleteValue?: boolean }>}
 */
export async function textInput(player, options) {
  const form = new UI.ModalFormData();
  if ('title' in options) form.title(options.title);
  form.textField(options.label, options.placeholder, options.defaultValue);
  if (options.allowDelete) form.toggle('値を削除する / Delete value');
  const { canceled, formValues } = await form.show(player);
  if (canceled) return { canceled: true, value: undefined }
  const _value = /** @type {string} */ (formValues[0]);
  const value = _value.replace(/\\n/g, '\n');
  const deleteValue = /** @type {boolean} */ (formValues[1]);

  return { canceled: false, value, deleteValue }
}