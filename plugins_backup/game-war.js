let handler = async (m, { conn, usedPrefix, args, command }) => {
  conn.war = conn.war ? conn.war : {}
  conn.war2 = conn.war2 ? conn.war2 : {}

  if (!args[0] || args[0] == "help") return m.reply(`*❏  منطقة الحرب*

[1] منطقة الحرب هي لعبة حرب بنظام _الهجوم بالتناوب_ أو الهجوم بالتناوب
[2] يمكن أن تبدأ اللعبة من 1 ضد 1 حتى 5 ضد 5
[3] رأس مال الحرب هو غنائم الحرب إذا فاز فريقك
[4] سيحصل كل لاعب على 5000 نقطة صحة (HP)
[5] يعتمد نجاح الهجوم على مستواك ومستوى العدو الذي سيتم مهاجمته
[6] فرصة الهجوم هي 40 ثانية، وأكثر من ذلك يعتبر AFK (يتم خصم 2500 نقطة صحة)
[7] سيفوز الفريق إذا خسر الفريق المنافس بالكامل (نقاط الصحة <= 0) وحصل على غنائم الحرب

*❏  الأوامر*
*${usedPrefix + command} join A/B* = الانضمام إلى اللعبة
*${usedPrefix + command} left* = مغادرة اللعبة
*${usedPrefix + command} money 10xx* = أموال الرهان
*${usedPrefix + command} player* = لاعبو اللعبة
*${usedPrefix + command} start* = بدء اللعبة`)


  if (args[0] == "money"){
    if (!(m.chat in conn.war)) return m.reply(`*يرجى إنشاء غرفة أولاً (اكتب .war join)*`)
    if(m.sender == conn.war[m.chat][0].user){
      if (args[1] != "undefined" && !isNaN(args[1])){
        args[1] = parseInt(args[1])
        if (args[1] < 1000) return m.reply('*الحد الأدنى 1000*')
        conn.war2[m.chat].money = args[1]
        return m.reply("*تم بنجاح تحديد رأس مال الحرب بمقدار " + Number(args[1]).toLocaleString() + "*")
      }else {
        return m.reply("*أدخل رأس مال رهان الحرب كأرقام (لا تستخدم نقاط)*\n\n.war money 100000")
      }
    }else {
      return conn.reply(m.chat,`*فقط @${conn.war[m.chat][0].user.split('@')[0]} كمنشئ للغرفة يمكنه تغيير رأس مال الحرب الأولي*`,m, {contextInfo : {mentionedJid : [conn.war[m.chat][0].user]}})
    }
  }

  // JOIN
  if (args[0] == "join"){
    
    if (global.db.data.users[m.sender].money < 1000) return m.reply("*يجب أن يكون لديك 1000 على الأقل للعب هذه اللعبة.*")
    // FIRST PLAYER
    if (!(m.chat in conn.war)) {
      conn.war2[m.chat] = {"war" : false, "turn" : 0, "time" : 0, "money" : 0}
      conn.war[m.chat] = []
      let exp = global.db.data.users[m.sender].exp
      conn.war[m.chat][0] = {"user": m.sender, "hp": 5000, "lvl": global.db.data.users[m.sender].level, "turn" : false}
      for (let i=1;i<10;i++){
        conn.war[m.chat][i] = {"user": "", "hp" : 0, "lvl" : 0, "turn" : false}
      }
      return m.reply(`*تم الانضمام إلى اللعبة بنجاح كفريق A*\n\n*.war join a/b* = الانضمام إلى اللعبة\n*.war start* = بدء اللعبة`)
    }else {   // NOT FIRST PLAYER
      // IF FULL
      if (conn.war2[m.chat].war) {
        return m.reply(`*لقد بدأت اللعبة بالفعل، لا يمكنك الانضمام.*`)
      }
      // IF YOU ALREADY JOIN THE GAME
      for (let i = 0; i < conn.war[m.chat].length ; i++) {
        if (m.sender == conn.war[m.chat][i].user){
          let total = 0
          for (let i = 0 ; i < 10 ; i++) {
            if (conn.war[m.chat][i].user == ""){
              total += 1
            }
          }
          return m.reply(`*لقد انضممت بالفعل إلى اللعبة*\n\n*.war join a/b* = الانضمام إلى اللعبة\n*.war start* = بدء اللعبة`)
        }
      }
      
      // JOIN MILIH TIM
      if (args[1]){
        if (args[1].toLowerCase() == "a"){
          if (conn.war2[m.chat].money == 0) return conn.reply(m.chat,`*يرجى من @${conn.war[m.chat][0].user.split('@')[0]} تحديد رأس مال الحرب الأولي (الحد الأدنى 1,000,000)*\n\n.war money 1000000`,m, {contextInfo : {mentionedJid : [conn.war[m.chat][0].user]}})
          if (global.db.data.users[m.sender].money < conn.war2[m.chat].money) return m.reply(`*يجب أن يكون لديك ${conn.war2[m.chat].money.toLocaleString()} على الأقل للعب هذه اللعبة.*`)
          for (let i = 1 ; i < 5 ; i++) {
            if (conn.war[m.chat][i].user == ""){
              let exp = global.db.data.users[m.sender].exp
              conn.war[m.chat][i] = {"user" : m.sender, "hp" : 5000, "lvl" : global.db.data.users[m.sender].level, "turn" : false}
              let total = 0
              for (let i = 0 ; i < 10 ; i++) {
                if (conn.war[m.chat][i].user == ""){
                  total += 1
                }
              }
              return m.reply(`*تم الانضمام إلى اللعبة بنجاح كفريق A*\n\n*.war join a/b* = الانضمام إلى اللعبة\n*.war start* = بدء اللعبة`)
            }
          } 
        }else if (args[1].toLowerCase() == "b"){
          if (conn.war2[m.chat].money == 0) return conn.reply(m.chat,`*يرجى من @${conn.war[m.chat][0].user.split('@')[0]} تحديد رأس مال الحرب الأولي (الحد الأدنى 1,000,000)*\n\n.war money 1000000`,m, {contextInfo : {mentionedJid : [conn.war[m.chat][0].user]}})
          if (global.db.data.users[m.sender].money < conn.war2[m.chat].money) return m.reply(`*يجب أن يكون لديك ${conn.war2[m.chat].money.toLocaleString()} على الأقل للعب هذه اللعبة.*`)
          for (let i = 5 ; i < 10 ; i++) {
            if (conn.war[m.chat][i].user == ""){
              let exp = global.db.data.users[m.sender].exp
              conn.war[m.chat][i] = {"user" : m.sender, "hp" : 5000, "lvl" : global.db.data.users[m.sender].level, "turn" : false}
              let total = 0
              for (let i = 0 ; i < 10 ; i++) {
                if (conn.war[m.chat][i].user == ""){
                  total += 1
                }
              }
              return m.reply(`*تم الانضمام إلى اللعبة بنجاح كفريق B*\n\n*.war join a/b* = الانضمام إلى اللعبة\n*.war start* = بدء اللعبة`)
            }
          }
        }else {
          return m.reply(`*اختر فريقًا واحدًا A أو B*\n\n.war join A\n.war join B`)
        }
      }else {
        // JOIN SESUAI URUTAN
        return m.reply(`*اختر فريقًا واحدًا A أو B*\n\n.war join A\n.war join B`)
      }
      

      // CHECK IF ROOM FULL
      for (let i = 0 ; i < conn.war[m.chat].length ; i++) {
        let total = 0
        if (conn.war[m.chat][i].user != ""){
          total += 1
        }
        if (total == 10) conn.war2[m.chat].war = true
      }
    }
  }

  // LEFT GAME
  if (args[0] == "left"){
    // IF GAME START
    if (conn.war2[m.chat].war) {
      m.reply(`*لقد بدأت الحرب بالفعل، لا يمكنك الخروج*`)
    }else {   // IF NOT
      for (let i = 0 ; i < 10 ; i++) {
        if (m.sender == conn.war[m.chat][i].user){
          conn.war[m.chat][i] = {"user": "", "hp" : 0, "lvl" : 0, "turn" : false}
          return m.reply(`*تم الخروج من اللعبة بنجاح*`)
        }
      }
      return m.reply(`*أنت لست في اللعبة حاليًا*`)
    }
  }

  // CEK PLAYER
  if (args[0] == "player"){ 
    if (!(m.chat in conn.war)) return m.reply(`*لا يوجد لاعبون انضموا إلى غرفة منطقة الحرب*`)
    var teamA = []
    var teamB = []
    var teamAB = []
    for (let i = 0 ; i < conn.war[m.chat].length ; i++){
      if (i < 5){
        if (conn.war[m.chat][i].user != "") teamA.push(conn.war[m.chat][i].user)
      }else {
        if (conn.war[m.chat][i].user != "") teamB.push(conn.war[m.chat][i].user)
      }
      teamAB.push(conn.war[m.chat][i].user)
    }
    // return m.reply(teamA[0])
    conn.reply(m.chat, `${conn.war2[m.chat].war ? '*الدور : ' + '@' + conn.war[m.chat][conn.war2[m.chat].turn].user.split('@')[0] + '*\n*الرهان : ' + Number(conn.war2[m.chat].money).toLocaleString() + '*\n\n' : '*الرهان : ' + Number(conn.war2[m.chat].money).toLocaleString() + '*\n\n' }*الفريق A :*\n` + teamA.map((v, i )=> `${conn.war[m.chat][i].hp > 0 ? '❤️ ' : '☠️ ' }@${v.split('@')[0]} (المستوى.${conn.war[m.chat][i].lvl} نقاط الصحة: ${conn.war[m.chat][i].hp})`).join`\n` + "\n\n*الفريق B :*\n" + teamB.map((v, i) => `${conn.war[m.chat][i+5].hp > 0 ? '❤️ ' : '☠️ ' }@${v.split('@')[0]} (المستوى.${conn.war[m.chat][i+5].lvl} نقاط الصحة: ${conn.war[m.chat][i+5].hp})`).join`\n`,m, {contextInfo: {
      mentionedJid: teamAB
    }})
  }

  // START GAME
  if (args[0] == "start"){
    if (conn.war2[m.chat].war) return m.reply(`*لقد بدأت الحرب بالفعل، لا يمكنك الانضمام.*`)
    let teamA = 0
    let teamB = 0
    for (let i=0;i<10;i++){
      if(i<5){
        if (conn.war[m.chat][i].user != "") teamA += 1
      }else{
        if (conn.war[m.chat][i].user != "") teamB += 1
      }
    }

    if (teamA == teamB && teamA > 0){
      conn.war2[m.chat].war = true
      for (let i=0;i<10;i++){
        if(i<5){
            if(conn.war[m.chat][i].user != "") conn.war[m.chat][i].hp = 5000
        }else{
            if(conn.war[m.chat][i].user != "") conn.war[m.chat][i].hp = 5000
        }
      }
      for (let i=0;i<5;i++){
        if (conn.war[m.chat][i].user != ""){
          let user = conn.war[m.chat][i].user
          return conn.reply(m.chat,`*بدأت اللعبة بنجاح*\n*يرجى من @${user.split('@')[0]} مهاجمة العدو*\n\n.war player = إحصائيات اللاعبين\n.attack @tag = مهاجمة الخصم`, m, {contextInfo: { mentionedJid: [user] }})
        }
      }
    }else {
      if (teamA > teamB){
        m.reply(`*يحتاج الفريق B إلى ${teamA-teamB} لاعبين آخرين لجعل اللعبة عادلة.*`)
      }else {
        m.reply(`*يحتاج الفريق A إلى ${teamB-teamA} لاعبين آخرين لجعل اللعبة عادلة.*`)
      }
    }
  } else {
    // It seems there's a logic issue in the original code. 
    // The `else` block after the `if (args[0] == "start")` would always trigger if args[0] is not "start"
    // and then throw 'Join Dulu'. 
    // This seems to be a catch-all that shouldn't be here, as it conflicts with the initial help message logic.
    // I'll comment it out to preserve the original structure while preventing the unintended error.
    // throw 'انضم أولاً' 
  }

}
handler.help = ['war']
handler.tags = ['game']
handler.command = /^(war)$/i
handler.group = true
export default handler
