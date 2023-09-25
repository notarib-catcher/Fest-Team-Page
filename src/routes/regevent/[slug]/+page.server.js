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
    //"S_FB_M" : ["SPORT_FB_M"], //Team event
    //"S_BB_M" : ["SPORT_BB_M"], //Team event
    //"S_VB_M" : ["SPORT_VB_M"], //Team event
    //"S_TN_M" : ["SPORT_TN_M"], //Team event
    //"S_TT_M" : ["SPORT_TT_M"], //Team event
    //"S_BB_F" : ["SPORT_BB_F"], //Team event
    //"S_TB_F" : ["SPORT_TB_F"], //Team event
    "S_TN_F" : ["SPORT_TN_F"],
    "S_TT_F" : ["SPORT_TT_F"],
    "S_ATH" : ["SPORT_ATH"],
    "S_CHS" : ["SPORT_CHS"],
    //"C_PRO" : ["CLTR_PRO"], //No need to register
    //"C_BOB" : ["CLTR_BOB"], //Team event
    //"C_GRD" : ["CLTR_GRD"], //Team event
    "C_FAS" : ["CLTR_FAS"],
    "C_STRSPL" : ["CLTR_PRO"],
    "C_THESHD" : ["CLTR_PRO"],
    "C_MNDSCR" : ["CLTR_PRO"],
    "C_MKTMHM" : ["CLTR_PRO"],
    "C_RANCOM" : ["CLTR_PRO"],
    "C_BTBLBD" : ["CLTR_PRO"],
    "C_NATNIR" : ["CLTR_PRO"],
    "C_FCSFRM" : ["CLTR_PRO"],
    "C_RMXRYL" : ["CLTR_PRO"],
    "C_MNGODY" : ["CLTR_PRO"],
    "C_BSHBTL" : ["CLTR_PRO"],
    "C_QZAPLZ" : ["CLTR_PRO"],
    "C_ZENITH" : ["CLTR_PRO"],
    "C_STRBET" : ["CLTR_PRO"],
    "C_BRNWAV" : ["CLTR_PRO"],
    "C_SAARANG" : ["CLTR_PRO"],
    "ES_BGDMHM" : ["ESPORTS"],
    "ES_VALRIS" : ["ESPORTS"],
    "ES_CODEXE" : ["ESPORTS"],
    "ES_CRWQST" : ["ESPORTS"],
    "ES_GOLQST" : ["ESPORTS"]



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
    const eventDoc = await t_events.findOne({_id:event, solo:true})

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

