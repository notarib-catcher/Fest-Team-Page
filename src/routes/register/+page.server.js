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

export const load =  async (/** @type {{ locals: { getSession: () => any; }; }} */ event) => {
    //Check for login and registration (or rather, lack of registration since this is WHY they are on this page)
    const session = await event.locals.getSession();
    if (!session?.user) {
        throw redirect(302, '/login'); //Not logged in => No access
    }

    const curr_user = await t_users.findOne({email:session.user.email})
    if(curr_user){
        throw redirect(303,'/')
    }

    //User unregistered

    return session.user
}

export const actions = {
    default: async (event) => {
        const session = await event.locals.getSession()

        if (!session?.user) {
            throw redirect(303, '/login'); //Not logged in => No access
        }

        const curr_user = await t_users.findOne({email:session.user.email})
        if(curr_user){
            throw redirect(303,'/')
        }


        /* retrieval and validation */
        const request = event.request
        const data = await request.formData()
        const name = data.get('name').replaceAll(/[^A-Za-z\s]/g, "").trim() || null
        const phone = data.get('phone').trim() || null

        const invite = data.get("invite") || null

        if(!phoneRegex.test(phone) || !name || name?.length < 1){
            return fail(422, "Phone and name are needed")
        }

        const mbstudent = (data.get('mbstudent') === "on" || data.get('mbstudent') === true)
        if(typeof(mbstudent) !== 'boolean'){
            return fail(422, "Invalid value for checkbox")
        }

        const institute = data.get('institute').replaceAll(/[^A-Za-z0-9\s]/g, "").trim() || "NOT PROVIDED"
        const regnum = data.get('regnum').toString().toLowerCase() || "NOT PROVIDED"
        const lremail = data.get('lremail')?.toLowerCase().trim() || "NOT PROVIDED"


        /*validation for MAHE student*/
        if(mbstudent){

            if(!lrRegex.test(lremail) && lremail !== "NOT PROVIDED"){
                return fail(422, {lremail, incorrect : true})
            }

            if(!regnumRegex.test(regnum) && regnum !== "NOT PROVIDED"){
                return fail(422, {regnum, incorrect:true})
            }



        }


        const doc = {
            email: session.user.email,
            name: name,
            phone: phone,
            mahe: mbstudent,
            lremail: (mbstudent)?lremail: "",
            regnum: (mbstudent)?regnum: "",
            institute: (!mbstudent)?institute:"MAHE BENGALURU",
            teams: []
        }

        await t_users.insertOne(doc)

        throw redirect(302, (invite?"/invite/"+invite:"/"))
    }
}