/*standard boilerplate*/
import {redirect} from "@sveltejs/kit";

const lrRegex = new RegExp('^[a-z0-9._-]+@learner\\.manipal\\.edu$')
const phoneRegex = new RegExp('^[0-9]{10}$')
import * as dotenv from 'dotenv' ;
import { fail } from '@sveltejs/kit';
dotenv.config()

import { MongoClient } from 'mongodb';

const dbclient = new MongoClient(process.env.MONGO_URL);
const database = dbclient.db(process.env.MONGO_DB_NAME);
const t_teams = database.collection(process.env.DB_COLL_PREFIX + "teams")
const t_users = database.collection(process.env.DB_COLL_PREFIX + "users")
const t_events = database.collection(process.env.DB_COLL_PREFIX + "events")
/*end standard boilerplate*/

const t_soloregs = database.collection(process.env.DB_COLL_PREFIX + "soloregs")

const passes_db = dbclient.db("ticketing")
const passes = passes_db.collection("passes")

const eventsToPasses = {

    "S_TN_F" : ["SPORT_TN_F"],
    "S_TT_F" : ["SPORT_TT_F"],
    "S_ATH" : ["SPORT_ATH"],

    //Cultural Featured
    // "C_PRO" : ["CLTR_PRO", "SUP_PRO"], //no regs
    // "C_BOB" : ["CLTR_BOB"], //team, 8
    // "C_GRC" : ["CLTR_GRD"], //team, 15
    // "C_GRW" : ["CLTR_GRD"], //team, 20
    // "C_FAS" : ["CLTR_FAS"], //team, 10

    //Cultural normie
    "C_MNDSCR": ["CLTR_PRO", "SUP_PRO"], //solo
    "C_BTSCAR": ["CLTR_PRO", "SUP_PRO"], //solo
    "C_STRBET": ["CLTR_PRO", "SUP_PRO"], //solo
    // "C_BTBLBD": ["CLTR_PRO", "SUP_PRO"], //team, 4
    "C_FCSFRM": ["CLTR_PRO", "SUP_PRO"], //solo
    "C_ZENITH": ["CLTR_PRO", "SUP_PRO"], //solo
    // "C_SHKTNK": ["CLTR_PRO", "SUP_PRO"], //team, 7
    "C_BSHBTL": ["CLTR_PRO", "SUP_PRO"], //solo
    "C_MNGODY": ["CLTR_PRO", "SUP_PRO"], //solo
    // "C_RANCOM": ["CLTR_PRO", "SUP_PRO"], //team, 3
    // "C_THESHD": ["CLTR_PRO", "SUP_PRO"], //team, 20
    // "C_STRSPL": ["CLTR_PRO", "SUP_PRO"], //team, 20
    // "C_MKTMHM": ["CLTR_PRO", "SUP_PRO"], //team, 3
    // "C_CINCRF": ["CLTR_PRO", "SUP_PRO"], //team, 4
    // "C_BTLBAB": ["CLTR_PRO", "SUP_PRO"], //team, 2
    "C_LOGLYM": ["CLTR_PRO", "SUP_PRO"], //solo

    //Esports
    // "ES_BGDMHM" : ["ESPORTS"], //team, 4
    // "ES_VALRIS" : ["ESPORTS"], //team, 7
    // "ES_CODEXE" : ["ESPORTS"], //team, 5
    // "ES_CRWQST" : ["ESPORTS"], //team, 2
    "ES_GOLQST" : ["ESPORTS"]  //solo


}


export const load =  async (/** @type {{ locals: { getSession: () => any; }; }} */ event) => {
    //Check for login and registration
    const session = await event.locals.getSession();

    const slug = event.params.slug
    if(!slug || !eventsToPasses[slug]){
        throw redirect(301, "/")
    }

    if (!session?.user) {
        throw redirect(302, '/login?regevent=' + slug); //Not logged in => No access
    }

    const curr_user = await t_users.findOne({email:session.user.email})
    if(!curr_user){
        throw redirect(302,'/register?regevent=' + slug)
    }


    //delete _id because it is non-serializable and returning it will cause svelte to bug
    delete curr_user._id

    return curr_user
}

export const actions = {
    default: async (event) => {
        const session = await event.locals.getSession();

        if(!session?.user){
            throw redirect(302,"/")
        }

        const slug = event.params.slug
        if(!slug){
            throw redirect(302, "/")
        }

        const allowedtoReg = await checkIfAllowedToRegister(session.user.email, slug)

        if(!allowedtoReg){
            return false
        }


        //register them
        await t_soloregs.insertOne(
            {
                event: slug,
                email: session.user.email
            }
        )

        throw redirect(302, "https://falak.mitblrfest.in/events/" + slug)

    }
}

const checkIfAllowedToRegister = async (email, event) => {
    /*
    * Steps to implement:
    * - Make sure event is a solo event
    * - Make sure that the user isn't already registered for that event
    * - Make sure the user has a pass to access that event
    * - Register the user for that event
    * - Redirect them to the event page
    */
    const eventDoc = await t_events.findOne({_id:event, solo:true, needreg: true})

    if(!eventDoc){
        console.log(1)
        return false
    }

    const existingRegDoc = await t_soloregs.findOne({email: email, event: event})

    if(existingRegDoc){
        console.log(2)
        return false
    }

    //Make sure they have the required pass. This also doubles as a check to make sure the event actually exists.

    let requiredpassArr = eventsToPasses[event]

    console.log(requiredpassArr)
    if(!requiredpassArr){
        console.log(3)
        return false
    }


    let allPasses = await passes.find({email: email}).toArray()
    console.log(allPasses)
    let allowCompete = false
    for(let pass of allPasses){
        console.log(pass.type)
        if(requiredpassArr.includes(pass.type)){
            allowCompete = true
        }
    }

    console.log(allowCompete)
    return allowCompete;

}

