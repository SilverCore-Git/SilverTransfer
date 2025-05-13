
const fs = require('fs');
const path = require('path');
const { randomUUID  } = require('crypto');
const { duplexPair } = require('stream');

const user_db_file = path.join(__dirname, '../db/users.json');



class session {

    create_id(type = 'session') {

        if (type = 'user') {
            return randomUUID();
        }

        else if (type == 'session') {
            return Date.now().toString(36) + Math.random().toString(36).substring(2);
        }

    }

    create(
            type = "temp", 
            session_parms = {
                user_agent: "",
                user_ip: "",
                premium: false,
                premium_parms: {}
            },
            user_id = null
        ) {

        if (type == 'first') {

            const user_id = this.create_id('user');

            let user_data = {
                user_info: {
                    ips: [ session_parms.user_ip ],
                    agents: [ session_parms.user_agent ]
                },
                user_stats: {},
                premium: premium,
                premium_settings: premium_parms,
                sessions: {},
                transferts: []
            };

            fs.readFile(user_db_file, 'utf8', (err, data) => {
                if (err) throw err;
              
                let jsonData = JSON.parse(data);
              
                jsonData[user_id] = user_data;
              
                fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
                  if (err) throw err;
                });
            });

        }

        else if (type == 'temp') {

            const date = new Date();
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

            const session_data = {
                ip: session_parms.user_ip,
                user_agents: session_parms.user_agent,
                status: "open",
                duration: {},
                time: {
                    h: date.getHours(),
                    mn: date.getMinutes(),
                    s: date.getSeconds()
                }
            };
            const session_id = this.create_id('session');  

            fs.readFile(user_db_file, 'utf8', (err, data) => {

                if (err) throw err;
                
                let jsonData = JSON.parse(data);
                let user = jsonData[user_id];
                
                if (!user.sessions) user.sessions = {};
                
                if (!user.sessions[dateKey]) user.sessions[dateKey] = {};
                
                user.sessions[dateKey][session_id] = session_data;
                
                jsonData[user_id] = user;
                
                fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
                  if (err) throw err;
                });

            });
        
        }

    };

    verify(user_id = null, session_id = null) {

        fs.readFile(user_db_file, 'utf8', (err, data) => {

            if (err) throw err;
          
            const date = new Date();
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            
            let jsonData = JSON.parse(data);
            let user = jsonData[user_id];
            
            if (!user.sessions) return false;
            
            if (!user.sessions[dateKey]) return false;
            
            if (!user.sessions[dateKey][session_id]) return false;
            
            return user.session[dateKey][session_id];

        });

    };

    close(user_id = null, session_id = null) {

        fs.readFile(user_db_file, 'utf8', (err, data) => {

            if (err) throw err;
          
            const date = new Date();
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

            let jsonData = JSON.parse(data);
            let user = jsonData[user_id];
            
            const startTimestamp = user.sessions[dateKey][session_id].time;
            const endTimestamp = date.getTime();
            const durationMs = endTimestamp - startTimestamp;
    
            // Convertir la durée en heures, minutes, secondes
            const durationSec = Math.floor(durationMs / 1000);
            const h = Math.floor(durationSec / 3600);
            const mn = Math.floor((durationSec % 3600) / 60);
            const s = durationSec % 60;
    
            user.sessions[dateKey][session_id].duration = { h, mn, s };
            user.sessions[dateKey][session_id].status = "close";

            jsonData[user_id] = user;

            fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
                if (err) throw err;
            });            

        });

    }

}


module.exports = new session();