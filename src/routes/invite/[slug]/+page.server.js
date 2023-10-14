/*standard boilerplate*/
import {redirect} from "@sveltejs/kit";

const lrRegex = new RegExp('^[a-z0-9._-]+@learner\\.manipal\\.edu$')
const regnumRegex = new RegExp('^[0-9]+$')
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

const passes_db = dbclient.db("ticketing")
const passes = passes_db.collection("passes")

const eventsToPasses = {

    //Sports (only team events are mentioned here)
    "S_FB_M" : ["SPORT_FB_M"],
    "S_BB_M" : ["SPORT_BB_M"],
    "S_VB_M" : ["SPORT_VB_M"],
    "S_TN_M" : ["SPORT_TN_M"],
    "S_TT_M" : ["SPORT_TT_M"],
    "S_BB_F" : ["SPORT_BB_F"],
    "S_TB_F" : ["SPORT_TB_F"],
    "S_CHS" : ["SPORT_CHS"],

    //Cultural Featured
    // "C_PRO" : ["CLTR_PRO", "SUP_PRO"], //no regs
    "C_BOB" : ["CLTR_BOB"], //team, 8
    "C_GRC" : ["CLTR_GRD"], //team, 15
    "C_GRW" : ["CLTR_GRD"], //team, 20
    "C_FAS" : ["CLTR_FAS"], //team, 10

    //Cultural Normie
    // "C_MNDSCR": ["CLTR_PRO", "SUP_PRO"], //solo
    // "C_BTSCAR": ["CLTR_PRO", "SUP_PRO"], //solo
    // "C_STRBET": ["CLTR_PRO", "SUP_PRO"], //solo
    "C_BTBLBD": ["CLTR_PRO", "SUP_PRO"], //team, 4
    // "C_FCSFRM": ["CLTR_PRO", "SUP_PRO"], //solo
    // "C_ZENITH": ["CLTR_PRO", "SUP_PRO"], //solo
    "C_SHKTNK": ["CLTR_PRO", "SUP_PRO"], //team, 7
    // "C_BSHBTL": ["CLTR_PRO", "SUP_PRO"], //solo
    // "C_MNGODY": ["CLTR_PRO", "SUP_PRO"], //solo
    "C_RANCOM": ["CLTR_PRO", "SUP_PRO"], //team, 3
    "C_THESHD": ["CLTR_PRO", "SUP_PRO"], //team, 20
    "C_STRSPL": ["CLTR_PRO", "SUP_PRO"], //team, 20
    "C_MKTMHM": ["CLTR_PRO", "SUP_PRO"], //team, 3
    "C_CINCRF": ["CLTR_PRO", "SUP_PRO"], //team, 4
    "C_BTLBAB": ["CLTR_PRO", "SUP_PRO"], //team, 2
    // "C_ECHOES": ["CLTR_PRO", "SUP_PRO"], //solo
    // "C_LOGLYM": ["CLTR_PRO", "SUP_PRO"], //solo REMOVED
    "C_SRGSAF": ["CLTR_PRO", "SUP_PRO"], //team, 4
    "C_BRNWAV": ["CLTR_PRO", "SUP_PRO"],
    "C_QZAPLZ": ["CLTR_PRO", "SUP_PRO"],

    //Esports - ALL WERE MADE SOLO
    // "ES_BGDMHM" : ["ESPORTS"], //team, 4
    // "ES_VALRIS" : ["ESPORTS"], //team, 7
    // "ES_CODEXE" : ["ESPORTS"], //team, 5
    // "ES_CRWQST" : ["ESPORTS"], //team, 2
    // "ES_GOLQST" : ["ESPORTS"]  //solo
}

export const load =  async (/** @type {{ locals: { getSession: () => any; }; }} */ event) => {

    const session = await event.locals.getSession();

    const slug = event.params.slug
    if(!slug){
        throw redirect(301, "/")
    }

    if (!session?.user) {
        throw redirect(302, '/login?invite=' + slug); //Not logged in => No access
    }

    const curr_user = await t_users.findOne({email:session.user.email})
    if(!curr_user){
        throw redirect(302,'/register?invite=' + slug)
    }


    //logged in user with profile

    const cteam = await t_teams.findOne({joincode: slug, allowjoin: true})

    if(!cteam){

        throw redirect(302,'/?404')
    }

    const teams_query = {
        members: {
            $elemMatch:{
                email: session.user.email
            }
        },
    }
    const teams = await t_teams.find(teams_query).toArray()

    for (let team of teams){
        if(team.event === cteam.event || team._id === cteam._id){

            throw redirect(302, "/?alreadyinevent")
        }
    }

    //No team with same event on this account - check if eligible


    if((cteam.event.startsWith("C_") && cteam.event.length >= 6) || cteam.event === "C_FAS"){

        //pass is needed

        let allowed = false
        for(let passtype of (eventsToPasses[cteam.event] || ["NEXIST"])){
            const passDoc = await passes.findOne({email:session.user.email, type:passtype})
            if(passDoc){
                allowed = true
                break
            }
        }

        if(!allowed){
            throw redirect(302, "https://falak.mitblrfest.in/events/" + cteam.event)
        }

    }

    const ID = cteam._id.toString()
    delete cteam._id
    cteam.members.push({name: curr_user.name, email: session.user.email})

    if(cteam.members.length >= cteam.maxmem){
        cteam.allowjoin = false
    }

    await t_teams.findOneAndUpdate({joincode: slug, allowjoin:true}, {$set: cteam})

    throw redirect(302, "/?team="+ID)
}