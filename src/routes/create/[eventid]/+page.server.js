import {redirect} from "@sveltejs/kit";

const lrRegex = new RegExp('^[a-z0-9._-]+@learner\\.manipal\\.edu$')
const regnumRegex = new RegExp('^[0-9]+$')
const phoneRegex = new RegExp('^[0-9]{10}$')
import * as dotenv from 'dotenv' ;
import { fail } from '@sveltejs/kit';
dotenv.config()

import { MongoClient } from 'mongodb';
import {uuidV4} from "mongodb/src/utils.js";

const dbclient = new MongoClient(process.env.MONGO_URL);
const database = dbclient.db(process.env.MONGO_DB_NAME);
const t_teams = database.collection(process.env.DB_COLL_PREFIX + "teams")
const t_users = database.collection(process.env.DB_COLL_PREFIX + "users")
const t_events = database.collection(process.env.DB_COLL_PREFIX + "events")

const passes_db = dbclient.db("ticketing")
const passes = passes_db.collection("passes")

const eventsToPasses = {
    "S_FB_M" : ["SPORT_FB_M"], //Team event
    "S_BB_M" : ["SPORT_BB_M"], //Team event
    "S_VB_M" : ["SPORT_VB_M"], //Team event
    "S_TN_M" : ["SPORT_TN_M"], //Team event
    "S_TT_M" : ["SPORT_TT_M"], //Team event
    "S_BB_F" : ["SPORT_BB_F"], //Team event
    "S_TB_F" : ["SPORT_TB_F"], //Team event
    "S_TN_F" : ["SPORT_TN_F"],
    "S_TT_F" : ["SPORT_TT_F"],
    "S_ATH" : ["SPORT_ATH"],
    "S_CHS" : ["SPORT_CHS"],
    //"C_PRO" : ["CLTR_PRO"], //No need to register
    "C_BOB" : ["CLTR_BOB"], //Team event
    "C_GRD" : ["CLTR_GRD"], //Team event
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

    const session = await event.locals.getSession();

    const slug = event.params.eventid
    if (!slug) {
        throw redirect(302, "/")
    }

    if (!session?.user) {
        throw redirect(302, '/login?createteam=' + slug); //Not logged in => No access
    }

    const curr_user = await t_users.findOne({email: session.user.email})
    if (!curr_user) {
        throw redirect(302, '/register?createteam=' + slug)
    }

    /**
     * - Check if event allows teams
     * - Check if user is eligible to create the team (pass)
     * - Check if user is already in a team
     * - Create the team
     */

    let eventDoc = await t_events.findOne({_id:slug})
    if(!eventDoc || eventDoc?.solo){
        throw redirect(302, "https://falak.mitblrfest.in/events/" + slug)
    }

    //event exists and is team event
    let allowed = false
    for(let passtype of eventsToPasses[slug]){
        const passDoc = await passes.findOne({email:session.user.email, type:passtype})
        if(passdoc){
            allowed = true
            break
        }
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
        if(team.event === slug){
            throw redirect(302, "/?alreadyinevent")
        }
    }

    const newID = uuidV4().toString()
    const newTeamDoc = {
        _id : newID,
        event : slug,
        allowjoin: true,
        owner : session.user.email,
        ownername : curr_user.name,
        joincode : joincodecreator(),
        members: [
            {
                name: curr_user.name,
                email: session.user.email
            },
        ],
        maxmem: 1000,
        name: curr_user.name + "-" + slug
    }

    await t_teams.insertOne(newTeamDoc)

    throw redirect(302, "/")

}

const joincodecreator = async () => {
    const letters = ["ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
    let code = ""
    for(let i = 0 ; i < 5; i++){
        let x = Math.floor(i*26)
        code += letters[x]
    }

    const existingTeam = await t_teams.findOne({joincode:code})
    if(!existingTeam){
        return code
    }
    else{
        return joincodecreator()
    }
}