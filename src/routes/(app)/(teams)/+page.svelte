<script>


    export let data
    let currentTeamIndex = -1
    $: currentTeam = data.teams[currentTeamIndex] || {}

    let copytext = "Click to Copy!"
    const eventArr = {
        "event-1" : "An Example Event"
    }
</script>

<div class="fixed -z-50 left-0 top-0 w-[100dvw] h-[100dvh] bg-gradient-to-bl from-blue-500 to-purple-100">
</div>
<div class=" w-screen flex flex-row">
    <div class=" max-md:hidden relative overflow-y-hidden overflow-x-clip  leftbar mt-[20px] rounded-lg left-[10px]  items-start w-screen md:w-[35%] bg-opacity-40 bg-white lg:w-[40%]">

        <div class="bg-clip-text w-full h-[40px] border-b-2 border-blue-100  mb-2 text-transparent bg-gradient-to-bl from-blue-800 to-purple-800 pl-4 pt-2">Your Teams</div>
        <div class="noscrollbar h-full overflow-scroll">
            {#each data.teams as team, i}
                <button class=" relative flex items-center justify-center p-2 bg-white whitespace-normal whitespace-pre-wrap leftbaritem rounded-lg h-[70px] bg-opacity-70" on:click={ async () => { currentTeamIndex = i }}>
                    <div class= " absolute m-auto lg:hidden text-black">
                        {team.name.length > 15 ? team.name.substring(0,15) + "..." : team.name}
                    </div>
                    <div class= " absolute m-auto max-lg:hidden text-black">
                        {team.name.length > 25 ? team.name.substring(0,25) + "..." : team.name}
                    </div>
                </button>
            {/each}
            <button class=" p-2 bg-white leftbaritem rounded-lg h-[70px] bg-opacity-70 font-extralight">
                + Create or Join a team
            </button>
        </div>


    </div>

    <div class="rightsidediv bg-white bg-opacity-40 rounded-lg">
        {#if currentTeamIndex != -1}
            <div class="bg-clip-text w-full h-[40px] border-b-2 border-blue-100 font-extralight  text-transparent bg-gradient-to-bl from-blue-800 to-purple-800 pl-4 pt-2">{data.teams[currentTeamIndex].name}</div>

            <div class=" px-4 py-2 bg-gradient-to-bl from-blue-800 to-purple-800 bg-clip-text text-transparent">
                {#if currentTeam.owner != data.user.email}
                    <span class="font-extralight">Owned by</span> {currentTeam.ownername} ({currentTeam.owner})
                {:else}
                    <span class="font-extralight">Owned by </span> <span class="  font-bold "> you.</span>
                {/if}
                <br>
                {#if currentTeam.allowjoin}
                    <span class="font-extralight">Invite people using </span> <button on:click = {() => {navigator.clipboard.writeText(new URL("/invite/"+ currentTeam.joincode.toUpperCase() + "/", window.location.origin).toString()); copytext = "Copied!"; setTimeout(() => {copytext = "Click to Copy!"}, 1000)}} class=" relative ctcbtn font-bold">this link.<span class="tooltip bg-black bg-opacity-70 text-white absolute left-0 whitespace-nowrap -translate-y-[30px] p-1 rounded-md">{copytext}</span></button> (Invite code: <span class="select-text font-bold">{currentTeam.joincode}</span>)
                {:else}
                    The team is not accepting new members.
                {/if}
                <br>
                <span class="font-extralight"> Competing in </span> <span class="font-bold"> {eventArr[currentTeam.event] || currentTeam.event}</span>
            </div>


        {/if}
    </div>
</div>


<style>
    .ctcbtn:hover > .tooltip{
        opacity: 1;
    }

    .ctcbtn:focus > .tooltip{
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
</style>