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

export const load =  async (/** @type {{ locals: { getSession: () => any; }; }} */ event) => {
    //Check for login and registration
    const session = await event.locals.getSession();

    const slug = event.params.slug
    if(!slug){
        throw redirect(301, "/")
    }

    if (!session?.user) {
        throw redirect(302, '/login?regevent=' + slug); //Not logged in => No access
    }

    const curr_user = await t_users.findOne({email:session.user.email})
    if(!curr_user){
        throw redirect(302,'/register?regevent=' + slug)
    }
}

const checkIfAllowedToRegister = async (email, event) => {
    //No checks at the moment, fix this later
    return true
}

