export default {
    //コマンドのプレフィックス
    prefix: `?`,
    //プレイヤーの初期の所持金
    initialMoney: 5000,
    //所持金をスコアボードで変更できるようにするか(オンラインのプレイヤーのみ)
    getMoneyByScoreboard: false,
    //所持金と連動するスコアボードのオブジェクト名
    moneyScoreboardName: `mc_money`,
    //平和主義切り替えのクールタイム(徴税タイミングごとに-1)
    peaceChangeCooltime: 3,
    //チャットの際にプレイヤー名の左に所属国を表示するか
    showCountryChatLeftName: true,
    //チャットの際にプレイヤー名の左にロール(着いてる中で一番高いロール)を表示するか
    showRoleChatLeftName: false,

    //デフォルトで平和主義にするか
    defaultPeace: true,
    //国を作るのに必要な金
    MakeCountryCost: 5000,
    //デフォルトのチャンクの値段
    defaultChunkPrice: 2000,
    //国際組織の設立にかかる金
    MakeInternationalOrganizationCost: 10000,
    //共通通貨の単位
    MoneyName: `$`,
    //初期の国庫の金
    initialCountryMoney: 0,
    //初期のリソースポイント
    initialCountryResourcePoint: 0,
    //徴税間隔(分)
    taxTimer: 2 * 60,
    //初期設定で税金をパーセント式にするか(falseの場合,定額制)
    taxInstitutionIsPer: true,
    //初期の税率(税額)
    taxPer: 10,
    //建国時に国庫を非公開にするか
    hideCountryMoney: true,
    //特別区域で許可する権限
    specialAllowPermissions: [`entityUse`, `blockUse`, `setHome`, `openContainer`],
    //荒野で許可する権限
    wildernessAllowPermissions: [`entityUse`, `blockUse`, `makeCountry`, `buyChunk`, `place`, `break`, `setHome`, `openContainer`],
    //平和主義国の維持費(1チャンク)
    MaintenanceFeePacifistCountries: 50,
    //非平和主義国の維持費(1チャンク)
    MaintenanceFeeNonPeacefulCountries: 5,
    //建国後何回分の徴税をなしにするか
    NonMaintenanceCostAccrualPeriod: 3,
    //1ヵ国におけるロールの最大数(デフォルトのロールも考慮) (3以上)
    maxRoleAmount: 15,

    //プレイヤーマーケットを有効にするかどうか
    playerMarketValidity: true,
    //プレイヤーマーケットの1人あたりの最大出品数
    maxMarketAmount: 15,

    //コンバットタグを有効にするか
    combatTagValidity: true,
    //コンバットタグが付くのはPvPのときだけにするか(falseにするとダメージを受けた際に付くようになる)
    combatTagValidityOnlyPvP: true,
    //コンバットタグが付いてる間、Homeコマンドなどのテレポート機能を使えなくするか
    combatTagNoTeleportValidity: true,
    //コンバットタグの持続時間
    combatTagSeconds: 30,

    //tpaを有効にするか
    tpaValidity: true,
    //tpaの有効秒数
    tpaValiditySeconds: 120,

    //cameraコマンド(視点を固定するコマンド)を有効にするか
    cameraValidity: true,

    //killコマンド(自滅するコマンド)を有効にするか
    killValidity: true,

    //shopを有効にするか
    shopValidity: true,

    //侵略(invade)を有効にするか
    invadeValidity: true,
    //侵略の制限時間(秒)
    invadeTimelimit: 60 * 20,
    //侵略のクールタイム(秒)
    invadeCooltime: 60 * 30,
    //侵略したあとの平和主義にできない期間
    invadePeaceChangeCooltime: 7,
    //建国後の侵略ができない、されない期間
    invadeProtectionDuration: 7,
    //隅からしか攻められないようにするか
    isAttackCorner: true,
    //指定した時間帯でないと戦争をできないようにするか
    isSettingCanInvadeDuration: true,
    //戦争が可能な時間帯
    canInvadeDuration: {
        //期間開始時刻(24時間制)
        startTime: { hour: 18, min: 0 },
        //期間終了時刻(24時間制)
        endTime: { hour: 23, min: 0 }
    }
};