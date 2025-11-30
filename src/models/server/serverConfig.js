const { Schema, model , mongoose} = require('mongoose');

const configSchema = new Schema({
    _id: String, 
    ServerName: {
        type: String,
        required: true,
    },
    
   gameGuessName: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    characterName: { type: [String], default: ['aether'] }, // เปลี่ยนเป็น array
    hexcode: { type: String, default: "A_t_e_r" }
},
gameGuessImg: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    character: { type: [String], default: ['kokomi'] }, // array
    image_url: { type: String, default: 'https://i.postimg.cc/zGkgn7fq/ดีไซน์ที่ยังไม่ได้ตั้งชื่อ.png' }
},
gameguessMeme: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    character: { type: [String], default: ['zhongli','morax'] }, // array
    meme: { type: String, default: 'เทพไม่มีตังค์' }

    },
    chatbot: {
        enabled: { type: Boolean, default: false },
        channelId: {type: String, default: null},
        customwords: { type: Map, of: new mongoose.Schema({ keywords: [String], response: String }, { _id: false }), default: {} } 
    },
     memberjoin: {
        enabled: { type: Boolean, default: false },
        channelId: {type: String, default: null},
        customwords: { type: String } 
    },
    memberleft: {
        enabled: { type: Boolean, default: false },
        channelId: {type: String, default: null},
        customwords: { type: String }
    },
    autoroles: {
        enabled: { type: Boolean, default: false },
        role1: {type: String, default: null},
        role2: {type: String, default: null},
        role3: {type: String, default: null},
        role4: {type: String, default: null},
        role5: {type: String, default: null},
        
    },
     autochangename: {
        enabled: { type: Boolean, default: false },
        format: { type: String, default: "{username}" }
    },
 
gameGuessCity: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    name: { type: [String], default: ['กรุงเทพมหานคร'] },
    hint: { type: String, default: 'ก_งเ_พ_ห_น_ค_' }
},
gameGuessCountry: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    name: { type: [String], default: ['ไทย'] },
    hint: { type: String, default: 'ประเทศที่มีสนามบินชื่อสุวรรณภูมิ' }
},
gameGuessFlage: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    name: { type: [String], default: ['ไทย'] },
    flag: { type: String, default: '🇹🇭' }
},
gamecountUp: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    currentNumber: { type: Number, default: 1 } // สำหรับเกมนับเลข
},



















    memberLeveling: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null }, // ห้องแจ้งเตือนเลเวล
    levelRoles: { type: Map, of: String, default: {} } 
    // ตัวอย่าง: { "5": "roleId1", "10": "roleId2" } 
},

   


    
   

    
}, {
   
    timestamps: true 
});

module.exports = model('ServerConfig', configSchema);