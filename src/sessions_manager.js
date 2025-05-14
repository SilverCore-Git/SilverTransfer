
const fs = require('fs').promises;
const path = require('path');
const { randomUUID  } = require('crypto');

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


    async create(
        type = "temp", 
        session_parms = {
          user_agent: "",
          user_ip: "",
          premium: false,
          premium_parms: {}
        },
        user_id = null
      ) {
        try {
          const rawData = await fs.readFile(user_db_file, 'utf8');
          const jsonData = JSON.parse(rawData);
    
          if (type === 'first') {
            const user_id = this.create_id('user');
            const user_data = {
              user_info: {
                ips: [session_parms.user_ip],
                agents: [session_parms.user_agent]
              },
              user_stats: {},
              premium: session_parms.premium,
              premium_settings: session_parms.premium_parms,
              sessions: {},
              transferts: []
            };
    
            jsonData[user_id] = user_data;
            await fs.writeFile(user_db_file, JSON.stringify(jsonData, null, 2));
            return { error: false, data: user_data, id: user_id };
    
          } else if (type === 'temp') {
            if (!user_id) {
              return { error: true, message: "user_id requis pour une session temporaire", id: user_id };
            }
    
            const date = new Date();
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    
            const session_data = {
              ip: session_parms.user_ip,
              user_agents: session_parms.user_agent,
              status: "open",
              duration: "",
              time: {
                h: date.getHours(),
                mn: date.getMinutes(),
                s: date.getSeconds()
              }
            };
    
            const session_id = this.create_id('session');
            const user = jsonData[user_id];
    
            if (!user) return { error: true, message: "Utilisateur non trouvé" };
    
            if (!user.sessions) user.sessions = {};
            if (!user.sessions[dateKey]) user.sessions[dateKey] = {};
            user.sessions[dateKey][session_id] = session_data;
    
            jsonData[user_id] = user;
            await fs.writeFile(user_db_file, JSON.stringify(jsonData, null, 2), );
            return { error: false, data: session_data, id: session_id };
          }
    
        } catch (err) {
          return { error: true, message: err.message || err };
        }
    }

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