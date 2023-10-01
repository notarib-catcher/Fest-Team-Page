import {redirect} from "@sveltejs/kit";

import * as dotenv from 'dotenv' ;

import {v4 as uuidV4} from "uuid";
dotenv.config()

import { MongoClient } from 'mongodb';


const dbclient = new MongoClient(process.env.MONGO_URL);
const database = dbclient.db(process.env.MONGO_DB_NAME);
const t_teams = database.collection(process.env.DB_COLL_PREFIX + "teams")
const t_users = database.collection(process.env.DB_COLL_PREFIX + "users")
const t_events = database.collection(process.env.DB_COLL_PREFIX + "events")

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
    //"C_LOGLYM": ["CLTR_PRO", "SUP_PRO"], //solo

    //Esports
    "ES_BGDMHM" : ["ESPORTS"], //team, 4
    "ES_VALRIS" : ["ESPORTS"], //team, 7
    "ES_CODEXE" : ["ESPORTS"], //team, 5
    "ES_CRWQST" : ["ESPORTS"], //team, 2
    // "ES_GOLQST" : ["ESPORTS"]  //solo
}

const maxmems = {
    //sport team events

    "S_FB_M" : 18,
    "S_BB_M" : 12,
    "S_TN_M" : 4,
    "S_TT_M" : 4,
    "S_VB_M" : 12,
    "S_TB_F" : 12,
    "S_BB_F" : 12,
    "S_CHS" : 6,

    //cultural (featured) events

    "C_BOB" : 8,
    "C_GRC" : 15,
    "C_GRW" : 20,
    "C_FAS" : 10,

    //cultural (regular) events

    "C_BTBLBD": 4,
    "C_SHKTNK": 7,
    "C_RANCOM": 3,
    "C_THESHD": 20,
    "C_STRSPL": 20,
    "C_MKTMHM": 3,
    "C_CINCRF": 4,
    "C_BTLBAB": 2,

    //esports events

    "ES_BGDMHM": 4,
    "ES_VALRIS": 7,
    "ES_CODEXE": 5,
    "ES_CRWQST": 2



}

export const load =  async (/** @type {{ locals: { getSession: () => any; }; }} */ event) => {

    const session = await event.locals.getSession();

    const slug = event.params.slug
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

    let eventDoc = await t_events.findOne({_id:slug, solo:false, needreg: true})

    if(!eventDoc){
        throw redirect(302, "https://falak.mitblrfest.in/events/" + slug)
    }

    //event exists and is team event
    let allowed = false
    for(let passtype of (eventsToPasses[slug] || ["NEXIST"])){
        const passDoc = await passes.findOne({email:session.user.email, type:passtype})
        if(passDoc){
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
        joincode : await joincodecreator(),
        members: [
            {
                name: curr_user.name,
                email: session.user.email
            },
        ],
        maxmem: maxmems[slug] || 1000,
        name: curr_user.name + "-" + slug
    }

    await t_teams.insertOne(newTeamDoc)

    throw redirect(302, "/?team=" + newID)

}

const joincodecreator = async () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let code = ""
    for(let i = 0 ; i < 5; i++){
        let x = Math.floor(Math.random()*letters.length)
        code += letters[x]
    }

    const existingTeam = await t_teams.findOne({joincode:code})
    if(!existingTeam){
        return code
    }
    else{
        return await joincodecreator()
    }
}