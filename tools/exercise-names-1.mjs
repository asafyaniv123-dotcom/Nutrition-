/* Every exercise's name in the other nine languages.
 *
 * Keyed by the English name, which build-exercises.mjs already carries and
 * guarantees unique. Hebrew lives in the list itself as the STORED id, English
 * is the pivot the rest are written from, and these are the other nine.
 *
 * The register is the one used in a gym, not a dictionary's: German lifters say
 * Bankdrücken and Kniebeuge, not "Bankpressen"; Japanese uses katakana for the
 * imported movements (ベンチプレス) and kanji for the native ones (腕立て伏せ);
 * Chinese says 卧推 and 深蹲. Where a language has simply adopted the English -
 * Dips, Burpees, Plank in half of Europe - that is what it says, and inventing
 * a local word would make the row harder to find rather than easier.
 *
 * These are searched as well as displayed, so a German typing Kniebeuge or a
 * Japanese typing スクワット reaches the squat.
 */
export const PART1 = {

/* ── חזה ─────────────────────────────────────────────────────────────── */
'Barbell Bench Press':{de:'Bankdrücken mit Langhantel',es:'Press de banca con barra',fr:'Développé couché à la barre',it:'Panca piana con bilanciere',pt:'Supino reto com barra',ja:'バーベルベンチプレス','zh-Hans':'杠铃卧推','zh-Hant':'槓鈴臥推',ar:'ضغط الصدر بالبار'},
'Dumbbell Bench Press':{de:'Bankdrücken mit Kurzhanteln',es:'Press de banca con mancuernas',fr:'Développé couché aux haltères',it:'Panca piana con manubri',pt:'Supino reto com halteres',ja:'ダンベルベンチプレス','zh-Hans':'哑铃卧推','zh-Hant':'啞鈴臥推',ar:'ضغط الصدر بالدمبل'},
'Incline Bench Press':{de:'Schrägbankdrücken',es:'Press inclinado con barra',fr:'Développé incliné à la barre',it:'Panca inclinata con bilanciere',pt:'Supino inclinado com barra',ja:'インクラインベンチプレス','zh-Hans':'上斜杠铃卧推','zh-Hant':'上斜槓鈴臥推',ar:'ضغط الصدر المائل بالبار'},
'Incline Dumbbell Press':{de:'Schrägbankdrücken mit Kurzhanteln',es:'Press inclinado con mancuernas',fr:'Développé incliné aux haltères',it:'Panca inclinata con manubri',pt:'Supino inclinado com halteres',ja:'インクラインダンベルプレス','zh-Hans':'上斜哑铃卧推','zh-Hant':'上斜啞鈴臥推',ar:'ضغط مائل بالدمبل'},
'Decline Bench Press':{de:'Negativbankdrücken',es:'Press declinado con barra',fr:'Développé décliné à la barre',it:'Panca declinata con bilanciere',pt:'Supino declinado com barra',ja:'デクラインベンチプレス','zh-Hans':'下斜杠铃卧推','zh-Hant':'下斜槓鈴臥推',ar:'ضغط الصدر المنحدر بالبار'},
'Decline Dumbbell Press':{de:'Negativbankdrücken mit Kurzhanteln',es:'Press declinado con mancuernas',fr:'Développé décliné aux haltères',it:'Panca declinata con manubri',pt:'Supino declinado com halteres',ja:'デクラインダンベルプレス','zh-Hans':'下斜哑铃卧推','zh-Hant':'下斜啞鈴臥推',ar:'ضغط منحدر بالدمبل'},
'Chest Press Machine':{de:'Brustpresse an der Maschine',es:'Press de pecho en máquina',fr:'Presse à pectoraux',it:'Chest press alla macchina',pt:'Supino na máquina',ja:'チェストプレスマシン','zh-Hans':'坐姿推胸器械','zh-Hant':'坐姿推胸器械',ar:'جهاز ضغط الصدر'},
'Incline Chest Press Machine':{de:'Schräge Brustpresse an der Maschine',es:'Press inclinado en máquina',fr:'Presse à pectoraux inclinée',it:'Chest press inclinata alla macchina',pt:'Supino inclinado na máquina',ja:'インクラインチェストプレスマシン','zh-Hans':'上斜推胸器械','zh-Hant':'上斜推胸器械',ar:'جهاز ضغط الصدر المائل'},
'Smith Machine Bench Press':{de:'Bankdrücken an der Smith-Maschine',es:'Press de banca en máquina Smith',fr:'Développé couché à la Smith machine',it:'Panca piana al multipower',pt:'Supino na máquina Smith',ja:'スミスマシンベンチプレス','zh-Hans':'史密斯机卧推','zh-Hant':'史密斯機臥推',ar:'ضغط الصدر على جهاز سميث'},
'Floor Press':{de:'Floor Press',es:'Press en el suelo',fr:'Développé au sol',it:'Floor press',pt:'Supino no chão',ja:'フロアプレス','zh-Hans':'地板卧推','zh-Hant':'地板臥推',ar:'ضغط أرضي'},
'Dumbbell Floor Press':{de:'Floor Press mit Kurzhanteln',es:'Press en el suelo con mancuernas',fr:'Développé au sol aux haltères',it:'Floor press con manubri',pt:'Supino no chão com halteres',ja:'ダンベルフロアプレス','zh-Hans':'哑铃地板卧推','zh-Hant':'啞鈴地板臥推',ar:'ضغط أرضي بالدمبل'},
'Dumbbell Fly':{de:'Fliegende mit Kurzhanteln',es:'Aperturas con mancuernas',fr:'Écartés aux haltères',it:'Croci con manubri',pt:'Crucifixo com halteres',ja:'ダンベルフライ','zh-Hans':'哑铃飞鸟','zh-Hant':'啞鈴飛鳥',ar:'تفتيح بالدمبل'},
'Incline Dumbbell Fly':{de:'Schräge Fliegende mit Kurzhanteln',es:'Aperturas inclinadas con mancuernas',fr:'Écartés inclinés aux haltères',it:'Croci su panca inclinata',pt:'Crucifixo inclinado',ja:'インクラインダンベルフライ','zh-Hans':'上斜哑铃飞鸟','zh-Hant':'上斜啞鈴飛鳥',ar:'تفتيح مائل بالدمبل'},
'Cable Crossover':{de:'Kabelzug-Überkreuzen',es:'Cruce de poleas',fr:'Écartés à la poulie',it:'Croci ai cavi',pt:'Crossover na polia',ja:'ケーブルクロスオーバー','zh-Hans':'龙门架夹胸','zh-Hant':'龍門架夾胸',ar:'تفتيح بالكابل'},
'Low to High Cable Fly':{de:'Fliegende am Kabel von unten',es:'Aperturas en polea de abajo arriba',fr:'Écartés à la poulie basse',it:'Croci ai cavi dal basso',pt:'Crucifixo na polia baixa',ja:'ローケーブルフライ','zh-Hans':'下往上龙门架夹胸','zh-Hant':'下往上龍門架夾胸',ar:'تفتيح بالكابل من الأسفل'},
'High to Low Cable Fly':{de:'Fliegende am Kabel von oben',es:'Aperturas en polea de arriba abajo',fr:'Écartés à la poulie haute',it:'Croci ai cavi dall’alto',pt:'Crucifixo na polia alta',ja:'ハイケーブルフライ','zh-Hans':'上往下龙门架夹胸','zh-Hant':'上往下龍門架夾胸',ar:'تفتيح بالكابل من الأعلى'},
'Pec Deck':{de:'Butterfly an der Maschine',es:'Contractor de pecho',fr:'Pec deck',it:'Pectoral machine',pt:'Voador (peck deck)',ja:'ペックデック','zh-Hans':'蝴蝶机夹胸','zh-Hant':'蝴蝶機夾胸',ar:'جهاز التفتيح'},
'Push Ups':{de:'Liegestütze',es:'Flexiones',fr:'Pompes',it:'Piegamenti sulle braccia',pt:'Flexões',ja:'腕立て伏せ','zh-Hans':'俯卧撑','zh-Hant':'伏地挺身',ar:'تمرين الضغط'},
'Incline Push Ups':{de:'Liegestütze erhöht',es:'Flexiones inclinadas',fr:'Pompes inclinées',it:'Piegamenti inclinati',pt:'Flexões inclinadas',ja:'インクライン腕立て伏せ','zh-Hans':'上斜俯卧撑','zh-Hant':'上斜伏地挺身',ar:'ضغط مائل'},
'Decline Push Ups':{de:'Liegestütze mit erhöhten Füßen',es:'Flexiones declinadas',fr:'Pompes déclinées',it:'Piegamenti declinati',pt:'Flexões declinadas',ja:'デクライン腕立て伏せ','zh-Hans':'下斜俯卧撑','zh-Hant':'下斜伏地挺身',ar:'ضغط منحدر'},
'Wide Push Ups':{de:'Breite Liegestütze',es:'Flexiones abiertas',fr:'Pompes larges',it:'Piegamenti a presa larga',pt:'Flexões abertas',ja:'ワイド腕立て伏せ','zh-Hans':'宽距俯卧撑','zh-Hant':'寬距伏地挺身',ar:'ضغط بقبضة واسعة'},
'Dips':{de:'Dips',es:'Fondos en paralelas',fr:'Dips',it:'Dip alle parallele',pt:'Mergulho nas paralelas',ja:'ディップス','zh-Hans':'双杠臂屈伸','zh-Hant':'雙槓臂屈伸',ar:'تمرين المتوازي'},
'Weighted Dips':{de:'Dips mit Zusatzgewicht',es:'Fondos lastrados',fr:'Dips lestés',it:'Dip zavorrati',pt:'Mergulho com peso',ja:'加重ディップス','zh-Hans':'负重双杠臂屈伸','zh-Hant':'負重雙槓臂屈伸',ar:'متوازي بأوزان'},
'Dumbbell Pullover':{de:'Überzüge mit Kurzhantel',es:'Pullover con mancuerna',fr:'Pullover à l’haltère',it:'Pullover con manubrio',pt:'Pullover com halter',ja:'ダンベルプルオーバー','zh-Hans':'哑铃仰卧上拉','zh-Hant':'啞鈴仰臥上拉',ar:'بولوفر بالدمبل'},
'Svend Press':{de:'Svend Press',es:'Press Svend',fr:'Svend press',it:'Svend press',pt:'Svend press',ja:'スヴェンドプレス','zh-Hans':'夹片推胸','zh-Hant':'夾片推胸',ar:'ضغط الأقراص'},

/* ── גב ──────────────────────────────────────────────────────────────── */
'Barbell Row':{de:'Langhantelrudern',es:'Remo con barra',fr:'Rowing à la barre',it:'Rematore con bilanciere',pt:'Remada curvada com barra',ja:'ベントオーバーロウ','zh-Hans':'杠铃划船','zh-Hant':'槓鈴划船',ar:'تجديف بالبار'},
'Reverse Grip Barbell Row':{de:'Langhantelrudern im Untergriff',es:'Remo con barra en supinación',fr:'Rowing barre en supination',it:'Rematore presa inversa',pt:'Remada com barra pegada supinada',ja:'リバースグリップロウ','zh-Hans':'反握杠铃划船','zh-Hant':'反握槓鈴划船',ar:'تجديف بقبضة معكوسة'},
'Pendlay Row':{de:'Pendlay Row',es:'Remo Pendlay',fr:'Rowing Pendlay',it:'Pendlay row',pt:'Remada Pendlay',ja:'ペンドレイロウ','zh-Hans':'潘德莱划船','zh-Hant':'潘德萊划船',ar:'تجديف بندلاي'},
'Dumbbell Row':{de:'Einarmiges Kurzhantelrudern',es:'Remo con mancuerna a una mano',fr:'Rowing haltère à un bras',it:'Rematore con manubrio',pt:'Remada unilateral com halter',ja:'ワンハンドダンベルロウ','zh-Hans':'单臂哑铃划船','zh-Hant':'單臂啞鈴划船',ar:'تجديف بالدمبل بيد واحدة'},
'Two Arm Dumbbell Row':{de:'Kurzhantelrudern beidarmig',es:'Remo con mancuernas a dos manos',fr:'Rowing haltères à deux bras',it:'Rematore con due manubri',pt:'Remada com dois halteres',ja:'ダンベルロウ（両手）','zh-Hans':'双臂哑铃划船','zh-Hant':'雙臂啞鈴划船',ar:'تجديف بالدمبل بيدين'},
'Chest Supported Row':{de:'Rudern mit Brustauflage',es:'Remo con apoyo de pecho',fr:'Rowing avec appui pectoral',it:'Rematore con appoggio al petto',pt:'Remada com apoio no peito',ja:'チェストサポートロウ','zh-Hans':'俯身支撑划船','zh-Hant':'俯身支撐划船',ar:'تجديف بإسناد الصدر'},
'Seal Row':{de:'Seal Row',es:'Remo seal',fr:'Seal row',it:'Seal row',pt:'Seal row',ja:'シールロウ','zh-Hans':'俯卧哑铃划船','zh-Hant':'俯臥啞鈴划船',ar:'تجديف منبطح'},
'Seated Cable Row':{de:'Rudern am Kabelzug sitzend',es:'Remo sentado en polea',fr:'Rowing assis à la poulie',it:'Pulley basso',pt:'Remada sentada na polia',ja:'シーテッドケーブルロウ','zh-Hans':'坐姿绳索划船','zh-Hant':'坐姿繩索划船',ar:'تجديف بالكابل جالسًا'},
'Single Arm Cable Row':{de:'Einarmiges Kabelrudern',es:'Remo en polea a una mano',fr:'Rowing poulie à un bras',it:'Pulley a un braccio',pt:'Remada na polia unilateral',ja:'ワンハンドケーブルロウ','zh-Hans':'单臂绳索划船','zh-Hant':'單臂繩索划船',ar:'تجديف بالكابل بيد واحدة'},
'Wide Grip Cable Row':{de:'Kabelrudern im Breitgriff',es:'Remo en polea con agarre ancho',fr:'Rowing poulie prise large',it:'Pulley presa larga',pt:'Remada na polia pegada aberta',ja:'ワイドグリップケーブルロウ','zh-Hans':'宽握绳索划船','zh-Hant':'寬握繩索划船',ar:'تجديف بالكابل بقبضة واسعة'},
'Machine Row':{de:'Rudern an der Maschine',es:'Remo en máquina',fr:'Rowing à la machine',it:'Rematore alla macchina',pt:'Remada na máquina',ja:'マシンロウ','zh-Hans':'器械划船','zh-Hant':'器械划船',ar:'تجديف على الجهاز'},
'Machine High Row':{de:'Hohes Rudern an der Maschine',es:'Remo alto en máquina',fr:'Rowing haut à la machine',it:'Rematore alto alla macchina',pt:'Remada alta na máquina',ja:'マシンハイロウ','zh-Hans':'高位器械划船','zh-Hant':'高位器械划船',ar:'تجديف عالٍ على الجهاز'},
'T-Bar Row':{de:'T-Bar Rudern',es:'Remo en T',fr:'Rowing T-bar',it:'Rematore a T',pt:'Remada cavalinho',ja:'Tバーロウ','zh-Hans':'T杠划船','zh-Hant':'T槓划船',ar:'تجديف تي بار'},
'Landmine Row':{de:'Landmine Rudern',es:'Remo landmine',fr:'Rowing landmine',it:'Landmine row',pt:'Remada landmine',ja:'ランドマインロウ','zh-Hans':'杠铃杆划船','zh-Hant':'槓鈴桿划船',ar:'تجديف لاندماين'},
'Inverted Row':{de:'Umgekehrtes Rudern',es:'Remo invertido',fr:'Rowing inversé',it:'Rematore inverso',pt:'Remada invertida',ja:'インバーテッドロウ','zh-Hans':'反向划船','zh-Hant':'反向划船',ar:'تجديف مقلوب'},
'TRX Row':{de:'Rudern am Schlingentrainer',es:'Remo en TRX',fr:'Rowing TRX',it:'Rematore al TRX',pt:'Remada no TRX',ja:'TRXロウ','zh-Hans':'悬吊划船','zh-Hant':'懸吊划船',ar:'تجديف بالأحزمة'},
'Deadlift':{de:'Kreuzheben',es:'Peso muerto',fr:'Soulevé de terre',it:'Stacco da terra',pt:'Levantamento terra',ja:'デッドリフト','zh-Hans':'硬拉','zh-Hant':'硬舉',ar:'الرفعة الميتة'},
'Trap Bar Deadlift':{de:'Kreuzheben mit der Trap-Bar',es:'Peso muerto con barra hexagonal',fr:'Soulevé de terre à la barre trap',it:'Stacco con trap bar',pt:'Terra com barra hexagonal',ja:'トラップバーデッドリフト','zh-Hans':'六角杠硬拉','zh-Hant':'六角槓硬舉',ar:'رفعة ميتة بالبار السداسي'},
'Rack Pull':{de:'Rack Pull',es:'Peso muerto desde rack',fr:'Rack pull',it:'Rack pull',pt:'Rack pull',ja:'ラックプル','zh-Hans':'架上硬拉','zh-Hant':'架上硬舉',ar:'سحب من الحامل'},

/* ── גב רחב ──────────────────────────────────────────────────────────── */
'Pull Ups':{de:'Klimmzüge',es:'Dominadas',fr:'Tractions',it:'Trazioni alla sbarra',pt:'Barra fixa',ja:'懸垂','zh-Hans':'引体向上','zh-Hant':'引體向上',ar:'العقلة'},
'Chin Ups':{de:'Klimmzüge im Untergriff',es:'Dominadas supinas',fr:'Tractions en supination',it:'Trazioni presa supina',pt:'Barra fixa pegada supinada',ja:'チンアップ','zh-Hans':'反握引体向上','zh-Hant':'反握引體向上',ar:'عقلة بقبضة معكوسة'},
'Wide Grip Pull Ups':{de:'Klimmzüge im Breitgriff',es:'Dominadas con agarre ancho',fr:'Tractions prise large',it:'Trazioni presa larga',pt:'Barra fixa pegada aberta',ja:'ワイドグリップ懸垂','zh-Hans':'宽握引体向上','zh-Hant':'寬握引體向上',ar:'عقلة بقبضة واسعة'},
'Neutral Grip Pull Ups':{de:'Klimmzüge im Neutralgriff',es:'Dominadas con agarre neutro',fr:'Tractions prise neutre',it:'Trazioni presa neutra',pt:'Barra fixa pegada neutra',ja:'パラレルグリップ懸垂','zh-Hans':'对握引体向上','zh-Hant':'對握引體向上',ar:'عقلة بقبضة محايدة'},
'Weighted Pull Ups':{de:'Klimmzüge mit Zusatzgewicht',es:'Dominadas lastradas',fr:'Tractions lestées',it:'Trazioni zavorrate',pt:'Barra fixa com peso',ja:'加重懸垂','zh-Hans':'负重引体向上','zh-Hant':'負重引體向上',ar:'عقلة بأوزان'},
'Assisted Pull Ups':{de:'Klimmzüge mit Band',es:'Dominadas asistidas con banda',fr:'Tractions assistées à l’élastique',it:'Trazioni assistite con elastico',pt:'Barra fixa assistida com elástico',ja:'バンド補助懸垂','zh-Hans':'弹力带辅助引体向上','zh-Hant':'彈力帶輔助引體向上',ar:'عقلة بمساعدة المطاط'},
'Assisted Pull Up Machine':{de:'Klimmzugmaschine',es:'Máquina de dominadas asistidas',fr:'Machine à tractions assistées',it:'Macchina trazioni assistite',pt:'Máquina de barra assistida',ja:'アシストプルアップマシン','zh-Hans':'助力引体向上机','zh-Hant':'助力引體向上機',ar:'جهاز العقلة المساعد'},
'Lat Pulldown':{de:'Latziehen',es:'Jalón al pecho',fr:'Tirage vertical',it:'Lat machine',pt:'Puxada frontal',ja:'ラットプルダウン','zh-Hans':'高位下拉','zh-Hant':'高位下拉',ar:'سحب أمامي'},
'Close Grip Pulldown':{de:'Latziehen im Enggriff',es:'Jalón con agarre estrecho',fr:'Tirage vertical prise serrée',it:'Lat machine presa stretta',pt:'Puxada com pegada fechada',ja:'クローズグリップラットプルダウン','zh-Hans':'窄握高位下拉','zh-Hant':'窄握高位下拉',ar:'سحب بقبضة ضيقة'},
'Wide Grip Lat Pulldown':{de:'Latziehen im Breitgriff',es:'Jalón con agarre ancho',fr:'Tirage vertical prise large',it:'Lat machine presa larga',pt:'Puxada com pegada aberta',ja:'ワイドグリップラットプルダウン','zh-Hans':'宽握高位下拉','zh-Hant':'寬握高位下拉',ar:'سحب بقبضة واسعة'},
'Reverse Grip Pulldown':{de:'Latziehen im Untergriff',es:'Jalón supino',fr:'Tirage vertical en supination',it:'Lat machine presa inversa',pt:'Puxada supinada',ja:'リバースグリップラットプルダウン','zh-Hans':'反握高位下拉','zh-Hant':'反握高位下拉',ar:'سحب بقبضة معكوسة'},
'Single Arm Lat Pulldown':{de:'Einarmiges Latziehen',es:'Jalón a una mano',fr:'Tirage vertical à un bras',it:'Lat machine a un braccio',pt:'Puxada unilateral',ja:'ワンハンドラットプルダウン','zh-Hans':'单臂高位下拉','zh-Hant':'單臂高位下拉',ar:'سحب بيد واحدة'},
'Straight Arm Pulldown':{de:'Überzüge am Kabelzug',es:'Pullover en polea con brazos rectos',fr:'Pull-over à la poulie bras tendus',it:'Pullover ai cavi a braccia tese',pt:'Pullover na polia com braços estendidos',ja:'ストレートアームプルダウン','zh-Hans':'直臂下压','zh-Hant':'直臂下壓',ar:'سحب بذراع مستقيمة'},
'Lat Pulldown Machine':{de:'Latzugmaschine',es:'Máquina de jalón dorsal',fr:'Machine à tirage dorsal',it:'Macchina per dorsali',pt:'Máquina de puxada',ja:'ラットプルダウンマシン','zh-Hans':'背部下拉器械','zh-Hant':'背部下拉器械',ar:'جهاز السحب الأمامي'},

/* ── טרפז ────────────────────────────────────────────────────────────── */
'Dumbbell Shrugs':{de:'Schulterheben mit Kurzhanteln',es:'Encogimientos con mancuernas',fr:'Haussements d’épaules aux haltères',it:'Scrollate con manubri',pt:'Encolhimento com halteres',ja:'ダンベルシュラッグ','zh-Hans':'哑铃耸肩','zh-Hant':'啞鈴聳肩',ar:'رفع الأكتاف بالدمبل'},
'Barbell Shrugs':{de:'Schulterheben mit Langhantel',es:'Encogimientos con barra',fr:'Haussements d’épaules à la barre',it:'Scrollate con bilanciere',pt:'Encolhimento com barra',ja:'バーベルシュラッグ','zh-Hans':'杠铃耸肩','zh-Hant':'槓鈴聳肩',ar:'رفع الأكتاف بالبار'},
'Cable Shrugs':{de:'Schulterheben am Kabelzug',es:'Encogimientos en polea',fr:'Haussements d’épaules à la poulie',it:'Scrollate ai cavi',pt:'Encolhimento na polia',ja:'ケーブルシュラッグ','zh-Hans':'绳索耸肩','zh-Hant':'繩索聳肩',ar:'رفع الأكتاف بالكابل'},
'Machine Shrugs':{de:'Schulterheben an der Maschine',es:'Encogimientos en máquina',fr:'Haussements d’épaules à la machine',it:'Scrollate alla macchina',pt:'Encolhimento na máquina',ja:'マシンシュラッグ','zh-Hans':'器械耸肩','zh-Hant':'器械聳肩',ar:'رفع الأكتاف على الجهاز'},
'Y Raise':{de:'Y-Raise',es:'Elevación en Y',fr:'Élévation en Y',it:'Alzate a Y',pt:'Elevação em Y',ja:'Yレイズ','zh-Hans':'Y字举','zh-Hant':'Y字舉',ar:'رفع على شكل Y'},

/* ── גב תחתון ────────────────────────────────────────────────────────── */
'Hyperextension':{de:'Rückenstrecken',es:'Hiperextensiones',fr:'Extensions lombaires',it:'Iperestensioni',pt:'Hiperextensão lombar',ja:'バックエクステンション','zh-Hans':'山羊挺身','zh-Hant':'山羊挺身',ar:'تمديد الظهر'},
'Weighted Hyperextension':{de:'Rückenstrecken mit Gewicht',es:'Hiperextensiones con peso',fr:'Extensions lombaires lestées',it:'Iperestensioni zavorrate',pt:'Hiperextensão com peso',ja:'加重バックエクステンション','zh-Hans':'负重山羊挺身','zh-Hant':'負重山羊挺身',ar:'تمديد الظهر بوزن'},
'45 Degree Back Extension':{de:'Rückenstrecken 45 Grad',es:'Hiperextensiones a 45 grados',fr:'Extensions lombaires à 45°',it:'Iperestensioni a 45 gradi',pt:'Extensão lombar a 45 graus',ja:'45度バックエクステンション','zh-Hans':'45度背伸展','zh-Hant':'45度背伸展',ar:'تمديد الظهر بزاوية 45'},
'Good Morning':{de:'Good Morning',es:'Buenos días con barra',fr:'Good morning',it:'Good morning',pt:'Bom dia (good morning)',ja:'グッドモーニング','zh-Hans':'早安式屈体','zh-Hant':'早安式屈體',ar:'تمرين الصباح'},
'Superman':{de:'Superman',es:'Superman',fr:'Superman',it:'Superman',pt:'Superman',ja:'スーパーマン','zh-Hans':'超人式','zh-Hant':'超人式',ar:'تمرين سوبرمان'},
'Bird Dog':{de:'Bird Dog',es:'Bird dog',fr:'Bird dog',it:'Bird dog',pt:'Bird dog',ja:'バードドッグ','zh-Hans':'鸟狗式','zh-Hant':'鳥狗式',ar:'تمرين الطائر والكلب'},

/* ── כתפיים ──────────────────────────────────────────────────────────── */
'Landmine Press':{de:'Landmine Schulterdrücken',es:'Press landmine',fr:'Développé landmine',it:'Landmine press',pt:'Desenvolvimento landmine',ja:'ランドマインプレス','zh-Hans':'杠铃杆推举','zh-Hant':'槓鈴桿推舉',ar:'ضغط لاندماين'},
'Overhead Press':{de:'Schulterdrücken mit Langhantel',es:'Press militar',fr:'Développé militaire',it:'Military press',pt:'Desenvolvimento militar',ja:'オーバーヘッドプレス','zh-Hans':'站姿杠铃推举','zh-Hant':'站姿槓鈴推舉',ar:'ضغط الكتف بالبار'},
'Dumbbell Shoulder Press':{de:'Schulterdrücken mit Kurzhanteln',es:'Press de hombros con mancuernas',fr:'Développé épaules aux haltères',it:'Lento avanti con manubri',pt:'Desenvolvimento com halteres',ja:'ダンベルショルダープレス','zh-Hans':'哑铃肩推','zh-Hant':'啞鈴肩推',ar:'ضغط الكتف بالدمبل'},
'Seated Dumbbell Press':{de:'Schulterdrücken sitzend',es:'Press de hombros sentado',fr:'Développé épaules assis',it:'Lento avanti da seduto',pt:'Desenvolvimento sentado',ja:'シーテッドダンベルプレス','zh-Hans':'坐姿哑铃肩推','zh-Hant':'坐姿啞鈴肩推',ar:'ضغط الكتف جالسًا'},
'Machine Shoulder Press':{de:'Schulterpresse an der Maschine',es:'Press de hombros en máquina',fr:'Presse à épaules',it:'Shoulder press alla macchina',pt:'Desenvolvimento na máquina',ja:'マシンショルダープレス','zh-Hans':'器械肩推','zh-Hant':'器械肩推',ar:'جهاز ضغط الكتف'},
'Smith Machine Shoulder Press':{de:'Schulterdrücken an der Smith-Maschine',es:'Press de hombros en máquina Smith',fr:'Développé épaules à la Smith machine',it:'Lento avanti al multipower',pt:'Desenvolvimento na máquina Smith',ja:'スミスマシンショルダープレス','zh-Hans':'史密斯机肩推','zh-Hant':'史密斯機肩推',ar:'ضغط الكتف على جهاز سميث'},
'Arnold Press':{de:'Arnold Press',es:'Press Arnold',fr:'Développé Arnold',it:'Arnold press',pt:'Desenvolvimento Arnold',ja:'アーノルドプレス','zh-Hans':'阿诺德推举','zh-Hant':'阿諾德推舉',ar:'ضغط أرنولد'},
'Push Press':{de:'Push Press',es:'Push press',fr:'Push press',it:'Push press',pt:'Push press',ja:'プッシュプレス','zh-Hans':'借力推举','zh-Hant':'借力推舉',ar:'ضغط بالدفع'},
'Lateral Raise':{de:'Seitheben',es:'Elevaciones laterales',fr:'Élévations latérales',it:'Alzate laterali',pt:'Elevação lateral',ja:'サイドレイズ','zh-Hans':'哑铃侧平举','zh-Hant':'啞鈴側平舉',ar:'رفرفة جانبية'},
'Cable Lateral Raise':{de:'Seitheben am Kabelzug',es:'Elevaciones laterales en polea',fr:'Élévations latérales à la poulie',it:'Alzate laterali ai cavi',pt:'Elevação lateral na polia',ja:'ケーブルサイドレイズ','zh-Hans':'绳索侧平举','zh-Hant':'繩索側平舉',ar:'رفرفة جانبية بالكابل'},
'Machine Lateral Raise':{de:'Seitheben an der Maschine',es:'Elevaciones laterales en máquina',fr:'Élévations latérales à la machine',it:'Alzate laterali alla macchina',pt:'Elevação lateral na máquina',ja:'マシンサイドレイズ','zh-Hans':'器械侧平举','zh-Hant':'器械側平舉',ar:'رفرفة جانبية على الجهاز'},
'Leaning Cable Lateral Raise':{de:'Seitheben am Kabel in Schräglage',es:'Elevaciones laterales inclinado en polea',fr:'Élévations latérales poulie en inclinaison',it:'Alzate laterali ai cavi inclinato',pt:'Elevação lateral inclinada na polia',ja:'リーニングケーブルサイドレイズ','zh-Hans':'侧倾绳索侧平举','zh-Hant':'側傾繩索側平舉',ar:'رفرفة جانبية بالكابل مع الميل'},
'Front Raise':{de:'Frontheben',es:'Elevaciones frontales',fr:'Élévations frontales',it:'Alzate frontali',pt:'Elevação frontal',ja:'フロントレイズ','zh-Hans':'前平举','zh-Hant':'前平舉',ar:'رفرفة أمامية'},
'Plate Front Raise':{de:'Frontheben mit Hantelscheibe',es:'Elevación frontal con disco',fr:'Élévation frontale avec disque',it:'Alzate frontali con disco',pt:'Elevação frontal com anilha',ja:'プレートフロントレイズ','zh-Hans':'杠铃片前平举','zh-Hant':'槓鈴片前平舉',ar:'رفرفة أمامية بالقرص'},
'Cable Front Raise':{de:'Frontheben am Kabelzug',es:'Elevación frontal en polea',fr:'Élévation frontale à la poulie',it:'Alzate frontali ai cavi',pt:'Elevação frontal na polia',ja:'ケーブルフロントレイズ','zh-Hans':'绳索前平举','zh-Hant':'繩索前平舉',ar:'رفرفة أمامية بالكابل'},
'Rear Delt Fly':{de:'Reverse Flys mit Kurzhanteln',es:'Aperturas posteriores con mancuernas',fr:'Oiseau aux haltères',it:'Alzate posteriori con manubri',pt:'Crucifixo inverso com halteres',ja:'リアデルトフライ','zh-Hans':'俯身哑铃飞鸟','zh-Hant':'俯身啞鈴飛鳥',ar:'رفرفة خلفية بالدمبل'},
'Reverse Pec Deck':{de:'Reverse Butterfly',es:'Contractor inverso',fr:'Pec deck inversé',it:'Pectoral machine inversa',pt:'Voador inverso',ja:'リバースペックデック','zh-Hans':'反向蝴蝶机','zh-Hant':'反向蝴蝶機',ar:'جهاز التفتيح العكسي'},
'Cable Rear Delt Fly':{de:'Reverse Flys am Kabelzug',es:'Aperturas posteriores en polea',fr:'Oiseau à la poulie',it:'Alzate posteriori ai cavi',pt:'Crucifixo inverso na polia',ja:'ケーブルリアデルトフライ','zh-Hans':'绳索反向飞鸟','zh-Hant':'繩索反向飛鳥',ar:'رفرفة خلفية بالكابل'},
'Face Pull':{de:'Face Pull',es:'Face pull',fr:'Face pull',it:'Face pull',pt:'Face pull',ja:'フェイスプル','zh-Hans':'面拉','zh-Hant':'面拉',ar:'سحب للوجه'},
'Upright Row':{de:'Aufrechtes Rudern',es:'Remo al mentón',fr:'Rowing menton',it:'Tirate al mento',pt:'Remada alta',ja:'アップライトロウ','zh-Hans':'直立划船','zh-Hant':'直立划船',ar:'تجديف عمودي'},
'Cable Upright Row':{de:'Aufrechtes Rudern am Kabelzug',es:'Remo al mentón en polea',fr:'Rowing menton à la poulie',it:'Tirate al mento ai cavi',pt:'Remada alta na polia',ja:'ケーブルアップライトロウ','zh-Hans':'绳索直立划船','zh-Hant':'繩索直立划船',ar:'تجديف عمودي بالكابل'},
'Band Pull Apart':{de:'Band Pull Apart',es:'Apertura con banda elástica',fr:'Écartés à l’élastique',it:'Aperture con elastico',pt:'Abertura com elástico',ja:'バンドプルアパート','zh-Hans':'弹力带扩胸','zh-Hant':'彈力帶擴胸',ar:'شد المطاط للجانبين'},
'Shoulder External Rotation':{de:'Außenrotation der Schulter',es:'Rotación externa de hombro',fr:'Rotation externe d’épaule',it:'Rotazione esterna della spalla',pt:'Rotação externa do ombro',ja:'ショルダーエクスターナルローテーション','zh-Hans':'肩外旋','zh-Hant':'肩外旋',ar:'دوران الكتف الخارجي'},
'Handstand Push Up':{de:'Handstand-Liegestütz',es:'Flexión en pino',fr:'Pompe en équilibre',it:'Piegamenti in verticale',pt:'Flexão em parada de mãos',ja:'逆立ち腕立て伏せ','zh-Hans':'倒立俯卧撑','zh-Hant':'倒立伏地挺身',ar:'ضغط بالوقوف على اليدين'},
'Clean and Press':{de:'Umsetzen und Drücken',es:'Cargada y press',fr:'Épaulé-développé',it:'Slancio con spinta',pt:'Arranco e desenvolvimento',ja:'クリーン＆プレス','zh-Hans':'翻站推举','zh-Hant':'翻站推舉',ar:'نتر وضغط'},
'Thruster':{de:'Thruster',es:'Thruster',fr:'Thruster',it:'Thruster',pt:'Thruster',ja:'スラスター','zh-Hans':'深蹲推举','zh-Hant':'深蹲推舉',ar:'ثراستر'},
'Snatch':{de:'Reißen',es:'Arrancada',fr:'Arraché',it:'Strappo',pt:'Arranco',ja:'スナッチ','zh-Hans':'抓举','zh-Hant':'抓舉',ar:'الخطف'}
};
