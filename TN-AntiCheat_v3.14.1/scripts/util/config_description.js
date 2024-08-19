const state = '有効/無効の設定';
const punishment = '検知された場合の対応';
const flagCount = 'Flagするまでの検知回数 (-1で無制限)';
const excludeTag = '持っていると検知から除外されるタグ';
const autoMuteCount = '自動ミュートされるまでの検知数 (-1で無制限)';
const tempMute = '一時的なミュートにするか (リログで解除)';

export const description = {
  permission: {
    desc: '権限の設定',
    admin: '全ての検知から除外される権限',
    builder: 'クリエイティブの使用が許可される権限',
    ban: 'BANされます',
    encrypt: 'タグを難読化して不正に権限を取られにくくする',
    tag: '使用するタグ名 (encryptが有効な場合は使われない)',
    players: '名前でプレイヤーを指定',
    ids: 'ID(Form上で見られます)でプレイヤーを指定',
    xuids: 'xuidでプレイヤーを指定'
  },
  command: {
    desc: 'コマンド関係の設定',
    prefix: 'prefix(コマンドの先頭につける文字)',
    enableConsole: 'サーバーのコンソールからのコマンドの実行を許可する'
  },
  itemList: {
    desc: 'アイテム系のモジュールで使用する禁止アイテムの設定',
    ban: 'このアイテムを使用/所持したプレイヤーはBANされます',
    kick: 'このアイテムを使用/所持したプレイヤーはKICKされます',
    notify: 'このアイテムを使用/所持したプレイヤーは通知されます'
  },
  nuker: {
    desc: 'Nukerを検知',
    state,
    punishment,
    limit: '1tickに何ブロックの破壊で検知するかの設定(ラグも考慮)',
    cancel: '壊されたブロックを再設置する'
  },
  namespoof: {
    desc: '不正な名前を検知します',
    state,
    punishment,
    maxLength: '名前の長さの最大値'
  },
  spammerA: {
    desc: '長文すぎるチャットを制限',
    state,
    maxLength: '最大文字数',
    autoMuteCount,
    tempMute
  },
  spammerB: {
    desc: '重複するチャットを制限',
    state,
    autoMuteCount,
    tempMute
  },
  spammerC: {
    desc: '速すぎるチャットを制限',
    state,
    minInterval: '最小の間隔 (ミリ秒で指定)',
    autoMuteCount,
    tempMute
  },
  instaBreak: {
    desc: '壊せないブロックの破壊を検知',
    state,
    punishment,
    cancel: '壊されたブロックを再設置する',
    detect: '検知するブロックのID'
  },
  itemCheckA: {
    desc: '禁止アイテムを持っていたら検知',
    state,
    notifyCreative: 'true -> クリエの人は削除だけしてbanやkickはしない'
  },
  itemCheckB: {
    desc: 'スポーンエッグを持っていたら検知',
    state,
    punishment
  },
  itemCheckC: {
    desc: 'アイテムの不正な個数を検知',
    state,
    punishment
  },
  itemCheckD: {
    desc: '不正なエンチャントレベルを検知',
    state,
    punishment,
    mode: '検知レベルの設定',
    clearItem: '検知した時にアイテムを削除する'
  },
  itemCheckE: {
    desc: '不正なエンチャントを検知',
    state,
    punishment,
    clearItem: '検知した時にアイテムを削除する'
  },
  placeCheckA: {
    desc: '禁止アイテムを置いたら検知',
    state,
    notifyCreative: 'true -> クリエの人はキャンセルだけしてbanやkickはしない'
  },
  placeCheckB: {
    desc: '設置した時にインベントリをチェック',
    state,
    punishment,
    flagCount,
    spawnEgg: 'スポーンエッグを含める',
    shulkerBox: 'シュルカーボックスの中身をチェックする',
    detect: '検知するインベントリ付きブロックのID'
  },
  placeCheckC: {
    desc: '設置時にブロックのデータをリセットします',
    state,
    excludeCreative: 'クリエの人は除外する',
    detect: '検知するブロックのID'
  },
  placeCheckD: {
    desc: '設置時にエンティティのデータをリセットします',
    state,
    excludeCreative: 'クリエの人は除外する',
    minecarts: '検知するトロッコ',
    boats: '検知するボート(チェスト付き)'
  },
  entityCheckA: {
    desc: '指定されたエンティティのスポーンを検知',
    state,
    punishment,
    detect: '検知するエンティティ'
  },
  entityCheckB: {
    desc: 'ドロップ状態の禁止アイテムを検知',
    state,
    spawnEgg: 'スポーンエッグを含めるかどうか',
    punishment
  },
  entityCheckC: {
    desc: '大量のエンティティのスポーンを検知',
    state,
    maxArrowSpawns: '1tickにスポーンできる矢の数',
    maxCmdMinecartSpawns: '1tickにスポーンできるコマブロ付きトロッコの数'
  },
  entityCheckD: {
    desc: 'エンティティのインベントリの中をチェック',
    state,
    spawnEgg: 'スポーンエッグを含めるかどうか',
    detect: '検知するエンティティ'
  },
  entityCounter: {
    desc: '異常な数のエンティティを検知',
    state,
    defaultCount: "エンティティの最大数 (-1で無制限)",
    kill: "設定値に達したときにkillする",
    checkInterval: "数をチェックする間隔(tick)",
    warnInterval: "警告を表示する間隔(tick)",
    detect: "最大数の個別の設定 ex: \"entityId\": [maxCount]"
  },
  reachA: {
    desc: '攻撃の長すぎるリーチを検知',
    state,
    punishment,
    flagCount,
    maxReach: '最大リーチ',
    excludeCustomEntities: 'バニラ以外のmobの検知を除外',
    excludeEntities: '除外するエンティティ'
  },
  reachB: {
    desc: 'ブロック設置の長すぎるリーチを検知',
    state,
    punishment,
    flagCount,
    maxReach: '最大リーチ',
    cancel: 'ブロックの設置をキャンセルする',
  },
  reachC: {
    desc: 'ブロック破壊の長すぎるリーチを検知',
    state,
    punishment,
    flagCount,
    maxReach: '最大リーチ',
    cancel: 'ブロックの破壊をキャンセルする',
  },
  autoClicker: {
    desc: '速すぎるクリックを検知',
    state,
    punishment,
    maxCPS: '1秒あたりの最大クリック数',
    flagCount
  },
  creative: {
    desc: 'クリエイティブになったら検知',
    state,
    punishment,
    defaultGamemode: '検知した時に設定するGamemode'
  },
  speedA: {
    desc: '速すぎる移動を検知',
    state,
    punishment,
    flagCount,
    maxVelocity: '許容するスピードの最大値',
    rollback: '検知した時に前いた位置までテレポートする',
    excludeTag
  },
  flyA: {
    desc: 'flyを検知 (ベータ)',
    state,
    punishment,
    flagCount,
    minFallDistance: '許容する落下距離の最小値',
    detectPiston: 'ピストンで押された時の誤検知を減らす (負荷がかかる可能性あり)',
    rollback: '検知した時に前いた位置までテレポートする',
    excludeTag
  },
  logger: {
    desc: 'ログの記録に関する設定',
    console: '検知メッセージをコンテンツログに出力する',
    maxLogs: '保存するログの数',
    shortName: 'メッセージ先頭 "TN-AntiCheat"の表示を"TN-AC"に変更',
    sendws: 'メッセージをsayで出力します (discord-mcbe用)',
  },
  others: {
    adminPanel: '管理者用パネルを呼び出すためのアイテム',
    debug: 'ログを表示 デバッグ用',
    fixBDS: 'BDSのOP検知のバグ回避用',
    blockCopy: '管理者アイテムでブロックをスニーク+タップするとコピーできます',
    timezoneOffset: 'timezone offset',
    
    tpsToScore: 'スコアボードにTPSを出力',
    'tpsToScore.updateInterval': '更新する間隔(ticks)',
    'tpsToScore.objective': 'スコアのオブジェクト名',
    'tpsToScore.name': 'スコアの名前'
  }
}