import { Util } from '../../util/util';
import { Command } from '../Command';
import { manageUnbanQueue } from '../../form/AdminPanel';
import { BanManager } from '../../util/BanManager';

const unbanCommand = new Command({
  name: 'unban',
  description: 'プレイヤーのBanを解除します',
  args: [ '', '<name: playerName>' ],
  aliases: [ 'pardon' ],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const [ _playerName ] = args;
  
  if (_playerName) {
    const playerName = Util.parsePlayerName(_playerName);
    BanManager.addUnbanQueue(playerName);
    origin.broadcast(Util.decorate(`§7${origin.name} >> §r${playerName}§r をunbanのリストに追加しました`));
    Util.writeLog({ type: 'unban.add', playerName, message: `source: command\nExecuted by ${origin.name}` });
  } else {
    if (origin.isPlayerOrigin()) {
      manageUnbanQueue(origin.sender, true).catch(e => console.error(e, e.stack));
    }
    if (origin.isServerOrigin()) {
      const names = BanManager.getUnbanQueue().map(entry => `- ${entry.name}`);
      origin.send(`UnbanQueue List (${names.length})\n${names.join('\n')}`)
    }
  }
});

export default unbanCommand;
