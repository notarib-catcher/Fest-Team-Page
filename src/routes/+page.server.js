/*standard boilerplate*/
import {fail, redirect} from "@sveltejs/kit";
import * as dotenv from 'dotenv' ;
dotenv.config()

import { MongoClient } from 'mongodb';
const dbclient = new MongoClient(process.env.MONGO_URL);
const database = dbclient.db(process.env.MONGO_DB_NAME);
const t_teams = database.collection(process.env.DB_COLL_PREFIX + "teams")
const t_users = database.collection(process.env.DB_COLL_PREFIX + "users")
const t_events = database.collection(process.env.DB_COLL_PREFIX + "events")
/*end standard boilerplate*/


const options = {

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

export const actions = {
    kick: async (event) => {
        const session = await event.locals.getSession()

        if (!session?.user) {
            throw redirect(302, '/login'); //Not logged in => No access
        }

        const curr_user = await t_users.findOne({email:session.user.email})
        if(!curr_user){
            throw redirect(302,'/register')
        }

        const request = event.request
        const data = await request.formData()
        const email = data.get('email')

        if(!email){
            return fail(400, "malformed")
        }


        const teamID = data.get('_id')

        if(!teamID){
            return fail(400, "malformed")
        }

        const team = await t_teams.findOne({_id: teamID})

        if(!team){
            return fail(404, "No team found")
        }
        //check if owner removal attempt
        if(email == team.owner){
            return fail(403, "Cannot remove team owner")
        }


        //only the owner can remove someone else
        if(email !== session.user.email){
            if(session.user.email !== team.owner){
                return fail(403, "Not team owner")
            }
        }

        // Either the owner is removing someone else, or someone is removing themselves.
        // This is allowed.
        // Process the request

        //prep the new doc
        delete team._id

        const newTeamArray = []
        for (let member of team.members){
            if(member.email !== email){
                newTeamArray.push(member)
            }
        }

        team.members = newTeamArray

        if(newTeamArray.length < team.maxmem){
            team.allowjoin = true
        }

        await t_teams.findOneAndUpdate({_id: teamID}, {$set: team})

        throw redirect(302, "/?rsuccess=yes&team=" + teamID)


    },

    delteam: async (event) => {
        const session = await event.locals.getSession()

        if (!session?.user) {
            throw redirect(302, '/login'); //Not logged in => No access
        }

        const curr_user = await t_users.findOne({email:session.user.email})
        if(!curr_user){
            throw redirect(302,'/')
        }

        const request = event.request
        const data = await request.formData()



        const teamID = data.get('_id')

        if(!teamID){
            return fail(400, "malformed")
        }

        const team = await t_teams.findOne({_id: teamID})

        if(!team){
            return fail(404, "No team found")
        }
        //check if owner
        if(session.user.email !== team.owner){
            return fail(403, "Need to be owner")
        }



        delete team._id

        team.members = []

        team.allowjoin = false

        team.owner = team.owner += "--FLAG:DELETE"

        await t_teams.findOneAndUpdate({_id: teamID}, {$set: team})

        throw redirect(302, "/?rsuccess=yes")


    }
}