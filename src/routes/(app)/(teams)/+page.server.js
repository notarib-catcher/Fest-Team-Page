/*standard boilerplate*/
import {redirect} from "@sveltejs/kit";
import * as dotenv from 'dotenv' ;
dotenv.config()

import { MongoClient } from 'mongodb';
const dbclient = new MongoClient(process.env.MONGO_URL);
const database = dbclient.db(process.env.MONGO_DB_NAME);
const t_teams = database.collection(process.env.DB_COLL_PREFIX + "teams")
const t_users = database.collection(process.env.DB_COLL_PREFIX + "users")
const t_events = database.collection(process.env.DB_COLL_PREFIX + "events")
/*end standard boilerplate*/


const projection = {
    _id: 0
}


const options = {
    projection: projection
}
export const load =  async (/** @type {{ locals: { getSession: () => any; }; }} */ event) => {
    //Check for login and registration
    const session = await event.locals.getSession();
    if (!session?.user) {
        throw redirect(303, '/login'); //Not logged in => No access
    }

    const curr_user = await t_users.findOne({email:session.user.email})
    if(!curr_user){
        throw redirect(303,'/register')
    }

    //Registered user
    const teams_query = {
        members: {
            $elemMatch:{
                email: session.user.email
            }
        }
    }
    const teams = await t_teams.find(teams_query, options).toArray()
    return {user: session.user, teams: teams}
}