<script>
    import crown from "../assets/crown-solid.svg"
    import xmark from "../assets/xmark-solid.svg"
    import leave from "../assets/arrow-right-from-bracket-solid.svg"
    import {onMount} from "svelte";
    import {browser} from "$app/environment";

    export let data
    let currentTeamIndex = -1
    $: currentTeam = data.teams[currentTeamIndex] || {}

    let copytext = "Click to Copy!"
    const eventArr = {
        "event-1" : "An Example Event"
    }

    let rsuccess = false
    let alreadyinevent = false
    onMount(() => {
        if(browser){
            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            rsuccess = urlParams.has('rsuccess')
            setTimeout(() => {rsuccess = false}, 5000)

            alreadyinevent = urlParams.has('alreadyinevent')
            setTimeout(() => {alreadyinevent = false}, 5000)


            const URLteam = urlParams.get('team')

            for(let [i, team] of data.teams.entries()){
                if(team._id === URLteam){
                    currentTeamIndex = i;
                }
            }

            window.history.pushState({}, document.title, window.location.pathname);
        }
    })
</script>
{#if rsuccess}
    <div class=" h-fit w-screen fixed flex items-center justify-center pointer-events-none select-none">
        <div class=" relative z-20 top-0  text-2xl font-semibold h-[50px] bg-black bg-opacity-70 w-fit p-2 rounded-lg mx-auto ModalPopIn">
            <div class="bg-clip-text bg-[#e4c359]  text-transparent">
                Removed successfully
            </div>
        </div>
    </div>
{/if}
{#if alreadyinevent}
    <div class=" h-fit w-screen fixed flex items-center justify-center pointer-events-none select-none">
        <div class=" relative z-20 top-0  text-xl font-semibold h-[50px] bg-black bg-opacity-70 w-fit p-2 rounded-lg mx-auto ModalPopIn">
            <div class="bg-clip-text bg-[#e4c359]  text-transparent">
                Already in a team for that event
            </div>
        </div>
    </div>
{/if}
<div class="fixed -z-50 left-0 top-0 w-[100dvw] h-[100dvh] bg-gradient-to-bl from-[#fe786f] to-[#f9baa8]">
</div>
<div class=" w-screen flex flex-row">
    <div class=" max-md:hidden relative overflow-y-hidden overflow-x-clip  leftbar mt-[20px] rounded-lg left-[10px]  items-start w-screen md:w-[40%] bg-opacity-40 bg-white lg:w-[30%] xl:w-[25%]">

        <div class="bg-clip-text w-full h-[40px] border-b-2 border-blue-100  mb-2 text-transparent bg-gradient-to-bl from-[#f6635c] to-[#f6635c] pl-4 pt-2">Your Teams</div>
        <div class="noscrollbar h-full overflow-scroll">
            {#each data.teams as team, i}
                {#if currentTeamIndex != i}
                    <button class=" active:scale-95  hover:scale-105 transition-all duration-200 shadow-md relative flex items-center justify-center p-2 bg-white whitespace-normal whitespace-pre-wrap leftbaritem rounded-lg h-[70px] bg-opacity-70" on:click={ async () => { currentTeamIndex = i }}>
                        <div class= " absolute m-auto lg:hidden text-black">
                            {team.name.length > 15 ? team.name.substring(0,15) + "..." : team.name}
                        </div>
                        <div class= " absolute m-auto max-lg:hidden text-black">
                            {team.name.length > 25 ? team.name.substring(0,25) + "..." : team.name}
                        </div>
                    </button>
                {:else}
                    <div class="  shadow-md relative flex items-center justify-center p-2 bg-gray-200 whitespace-normal whitespace-pre-wrap leftbaritem rounded-lg h-[70px] bg-opacity-70">
                        <div class= " absolute m-auto lg:hidden text-black">
                            {team.name.length > 15 ? team.name.substring(0,15) + "..." : team.name}
                        </div>
                        <div class= " absolute m-auto max-lg:hidden text-black">
                            {team.name.length > 25 ? team.name.substring(0,25) + "..." : team.name}
                        </div>
                    </div>
                {/if}
            {/each}
            <button class=" active:scale-95  hover:scale-105 transition-all duration-200 bg-white leftbaritem rounded-lg h-[70px] bg-opacity-70 font-extralight shadow-md">
                + Create or Join a team
            </button>
        </div>


    </div>

    <div class="rightsidediv bg-white bg-opacity-40 rounded-lg">
        {#if currentTeamIndex >= 0}
            <div class="bg-clip-text w-full h-[40px] border-b-2 border-blue-100  text-transparent bg-gradient-to-bl from-[#f6635c] to-[#f6635c] pl-4 pt-2">{data.teams[currentTeamIndex].name}</div>

            <div class=" px-4 py-2 bg-gradient-to-bl from-[#f6635c] to-[#f6635c] bg-clip-text text-transparent">
                {#if currentTeam.owner != data.user.email}
                    <span class="font-extralight">Owned by</span> {currentTeam.ownername} ({currentTeam.owner})
                {:else}
                    <span class="font-extralight">Owned by </span> <span class="  font-bold "> you.</span>
                {/if}
                <br>
                {#if currentTeam.allowjoin}
                    <span class="font-extralight">Invite people using </span> <button on:click = {() => {navigator.clipboard.writeText(new URL("/invite/"+ currentTeam.joincode.toUpperCase() + "/", window.location.origin).toString()); copytext = "Copied!"; setTimeout(() => {copytext = "Click to Copy!"}, 1000)}} class=" relative ctcbtn font-bold text-[#f6635c]">this link.<span class="tooltip bg-black bg-opacity-70 text-white absolute left-0 whitespace-nowrap -translate-y-[30px] p-1 rounded-md">{copytext}</span></button> <br class="md:hidden">(Invite code: <span class="select-text font-bold">{currentTeam.joincode}</span>)
                {:else}
                    The team is not accepting new members.
                {/if}
                <br>
                <span class="font-extralight"> Competing in </span> <span class="font-bold"> {eventArr[currentTeam.event] || currentTeam.event}</span>
            </div>


            <div>
                <div class="bg-clip-text w-full h-[40px] border-b-2 border-blue-100 text-transparent bg-gradient-to-bl from-[#f6635c] to-[#f6635c] pl-4 pt-2">Members</div>

                <div class=" p-4 h-full gap-2 w-full grid grid-cols-2 max-md:grid-cols-1">
                    {#each currentTeam.members as member , i}

                        <div class=" relative bg-white w-full px-4 py-2 text-black h-[100px] rounded-lg shadow-xl">
                            <div class=" absolute mx-auto h-full left-0 top-0 w-fit flex items-center justify-center pl-4">
                                <div>
                                    <span class=" font-bold ">{member.name}</span>
                                    <br>
                                    <span class="font-extralight">{member.email}</span>
                                </div>
                            </div>
                            <div class=" absolute h-full right-0 top-0 pr-4 w-fit flex items-center justify-center">
                                {#if member.email === currentTeam.owner}
                                    <img class="relative pr-1 box-content" src={crown} width="20px" height="20px">
                                {:else if member.email === data.user.email}
                                    <form id={"kickselfform" + i} hidden method="POST">
                                        <input name="email" type="text" value={member.email} hidden>
                                        <input name="_id" type="text" value={currentTeam._id} hidden>
                                    </form>
                                    <button form={"kickselfform" + i} type="submit"><img class="relative  bg-black bg-opacity-0 hover:bg-opacity-10 active:scale-105 transition-all duration-200 p-1 rounded-lg box-content" src={leave} width="20px" height="20px"></button>
                                {:else if currentTeam.owner === data.user.email}
                                    <form id={"kickform" + i} hidden method="POST">
                                        <input name="email" type="text" value={member.email} hidden>
                                        <input name="_id" type="text" value={currentTeam._id} hidden>
                                    </form>
                                    <button form={"kickform" + i} type="submit" ><img class="relative  bg-black bg-opacity-0 hover:bg-opacity-10 active:scale-105 transition-all duration-200 p-1 rounded-lg box-content" src={xmark} width="20px" height="20px"></button>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>

            </div>
        {:else}
            <div class=" h-full w-full flex items-center justify-center">
                <div class=" h-fit w-fit">
                    <span class=" text-black text-opacity-40 text-2xl">
                        Select a team from the left
                    </span>
                </div>
            </div>
        {/if}
    </div>
</div>


<style>
    .ctcbtn:hover > .tooltip{
        opacity: 1;
    }

    .ctcbtn > .tooltip{

        opacity: 0;
        transition: all;
        transition-duration: 100ms;

    }
    .leftbaritem{
        width: calc(100% - 20px);
        margin: 5px 10px;
    }

    .rightsidediv{
        width: calc(100% - 40px);
        height: calc(100dvh - 40px);;
        margin: 20px;
    }

    .leftbar{
        height: calc(100dvh - 40px);
        -ms-overflow-style: none; /* for Internet Explorer, Edge */
        scrollbar-width: none; /* for Firefox */

    }

    .noscrollbar{
        box-sizing: padding-box;
        -moz-box-sizing: padding-box;
        -webkit-box-sizing: padding-box;
        padding-bottom: 60px;
        overflow: auto;
        -ms-overflow-style: none; /* for Internet Explorer, Edge */
        scrollbar-width: none; /* for Firefox */
    }

    .ModalPopIn{
        transform: translateY(-200px);
        animation-name: popinModal;
        animation-duration: 4000ms;
        animation-iteration-count: 1;
        animation-fill-mode: forward;
    }





    @keyframes popinModal{
        0%{
            transform: translateY(-200px);
        }
        25%{
            transform: translateY(5px);
        }
        50%{
            transform: translateY(5px);
        }
        100%{
            transform: translateY(-200px);
        }
    }
</style>