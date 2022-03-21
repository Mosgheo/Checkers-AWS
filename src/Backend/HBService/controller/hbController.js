require("dotenv").config()

const services = new Map() /*/ 
   seviceName ->  {   
        id:String, 
        backup:Obj,
        hb_loss:Int,
    }
*/
const heartbeat_timeout = new Map()

//Contains all services of which registration is still needed, if size > 0 system needs to be paused
let system_paused = new Set(process.env.SERVICES.split(','))

/**
 * 
 * @param {*} service_name which url is needed
 * @returns HTTP url associated to @service_name
 */
function service_to_url(service_name){
    const socket_name = "SOCKET_SERVICE"
    const user_name = "USER_SERVICE"
    const game_name = "GAME_SERVICE"
    switch(service_name){
        case socket_name:
            return process.env.SOCKET_SERVICE
        case user_name:
            return process.env.USER_SERVICE
        case game_name:
            return process.env.GAME_SERVICE
        default:
            return ""
    }
}

function is_paused() {return system_paused.size > 0}
/**
 * 
 * @param {*} service_name service to check heartbeats from
 */
async function set_heartbeat_timeout(service_name){
    heartbeat_timeout.set(service_name,setTimeout(async()=>{
        heartbeat_timeout.delete(service_name)
        console.log(service_name+"just lost a heartbeat")
        services.get(service_name).hb_loss++
        //If for a service 2 consequent hb are lost, such service is considered DOWN and system freezed until new service registration
        if(services.get(service_name).hb_loss == 2){
            console.log("Havent heard from "+service_name+"in a while, freezing the system")
            freeze_system(service_name)
        }else{
            set_heartbeat_timeout(service_name)
        }

    },process.env.HB_TIMEOUT))
}

function initialize_service(service_name,url){
    //There is a backup, retrieve it
    let backup = ""
    if(services.has(service_name)){
        backup = services.get(service_name).backup
        services.set(service_name,{
            id: url,
            backup:backup,
            hb_loss:0
        })
    }else{
        services.set(service_name,{
            id: url,
            backup:"",
            hb_loss:0
        })
    }
    set_heartbeat_timeout(service_name)
    system_paused.delete(service_name)
    return {
        status:true,
        backup:backup
    }
}
//Tell all services that system is up and running and make them work
async function restore_system(){
    console.log("Restarting system")
}
//Tell all services system needs to be paused a while.
function freeze_system(service_name){
    system_paused.add(service_name)
    services.delete(service_name)
}

exports.register = async function(req,res){
    const service_name = req.body.service_name
    if(services.has(service_name)){
        console.log("Received a register request from "+service_name+" but for what I can tell it's already running, refusing request")
        res.status(500).send({message:"Service already up"})
    }else{
        //If this alleged service is one of the application's one.
        if(process.env.SERVICES.includes(service_name)){
            console.log("Registering "+service_name)
            const initialized = initialize_service(service_name,service_to_url(service_name))
            if(initialized.status){
                res.status(200).json({backup:initialized.backup})
                //If this was the last service waiting to be registered, system can start working
                if(system_paused.size == 1 && system_paused.has(service_name)){
                    system_paused.delete(service_name)
                    await restore_system()
                }
            }else{
                res.status(500).send({message:"Error while initializing services, please try again"})
            }
        }
    }
}

exports.heartbeat = async function(req,res){
    const service_name = req.body.service_name
    const backup = req.body.backup
    if(services.has(service_name)){
        console.log("Received an heartbeat from "+service_name)
        services.get(service_name).backup = backup
        services.get(service_name).hb_loss = 0
        clearTimeout(heartbeat_timeout.get(service_name))
        heartbeat_timeout.delete(service_name)
        set_heartbeat_timeout(service_name)
        //Returns whether the system is up and running or is waiting for more services to register
        res.status(200).send({paused:is_paused()})
    }else{
        res.status(400).send()
    }

}
