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

    //No team with same event on this account - go ahead and add
    const ID = cteam._id.toString()
    delete cteam._id
    cteam.members.push({name: curr_user.name, email: session.user.email})

    if(cteam.members.length >= cteam.maxmem){
        cteam.allowjoin = false
    }

    await t_teams.findOneAndUpdate({joincode: slug, allowjoin:true}, {$set: cteam})

    throw redirect(302, "/?team="+ID)
}