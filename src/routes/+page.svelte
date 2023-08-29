<script>
    import crown from "../assets/crown-solid.svg"
    import xmark from "../assets/xmark-solid.svg"
    import leave from "../assets/arrow-right-from-bracket-solid.svg"
    import leftclose from "../assets/less-than-solid.svg"
    import enterarrow from "../assets/arrow-right-solid.svg"
    import menuburger from "../assets/bars-solid.svg"
    import {onMount} from "svelte";
    import {browser} from "$app/environment";
    import {signOut} from "@auth/sveltekit/client";

    let showmenu = true

    let invcode
    const hitkey = async (e) => {

        if(invcode.length !== 6){
            return
        }

        if (e.key === "Enter" || e.bypass){
            window.location = "/invite/" + invcode
        }
    }

    export let data
    let currentTeamIndex = -1
    $: currentTeam = data.teams[currentTeamIndex] || {}

    let copytext = "Click to Copy!"
    const eventArr = {
        "event-1" : "An Example Event"
    }

    let rsuccess = false
    let alreadyinevent = false

    let mobilemenu
    let mobilemenubackdrop
    const closeMenu = async () => {
        mobilemenu.classList.remove("menumoveinleft")
        mobilemenubackdrop.classList.remove("blurinmenubkd")
        mobilemenu.classList.add("menumoveoutleft")
        mobilemenubackdrop.classList.add("bluroutmenubkd")
        setTimeout(() => {
            mobilemenu.hidden = true
            mobilemenubackdrop.hidden = true
            mobilemenu.classList.add("menumoveinleft")
            mobilemenubackdrop.classList.add("blurinmenubkd")
            mobilemenubackdrop.classList.remove("bluroutmenubkd")
            mobilemenu.classList.remove("menumoveoutleft")
        },270)
    }

    const openMenu = async () => {
        mobilemenu.hidden = false
        mobilemenubackdrop.hidden = false
    }
    onMount(() => {
        if(browser){
            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            rsuccess = urlParams.has('rsuccess')
            setTimeout(() => {rsuccess = false}, 5000)

            alreadyinevent = urlParams.has('alreadyinevent')
            setTimeout(() => {alreadyinevent = false}, 5000)

            document.addEventListener('input', async ()=>{
                invcode = invcode.toUpperCase().replaceAll(/[^A-Z]/g,"")
            })

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
<!-- popins -->
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
<!-- end- popins -->
<div class="fixed -z-50 left-0 top-0 w-[100dvw] h-[100dvh] bg-gradient-to-bl from-[#fe786f] to-[#f9baa8]">
</div>


<!-- Mobile menu -->

<div bind:this={mobilemenubackdrop} class="md:hidden fixed w-[100dvh] h-[100dvh] z-40 backdrop-blur-md  top-0 left-0 overlayblur blurinmenubkd" >
</div>

<div bind:this={mobilemenu} class="md:hidden menumoveinleft fixed max-sm:w-[70%]  w-[50%] h-[100dvh] z-[45] bg-white bg-opacity-30 left-0" >
    <div class="w-full">
        <button on:click={closeMenu}>
            <img class="relative  bg-black bg-opacity-0 hover:bg-opacity-10 active:scale-105 transition-all duration-200 p-1 rounded-lg box-content mt-1 ml-1" src={leftclose} width="15px" height="15px">
        </button>
    </div>
    <div class="relative mb-2">
        <div class="relative bg-clip-text w-full h-[30px] border-b-2 border-blue-100  text-transparent bg-gradient-to-bl from-[#f6635c] to-[#f6635c] pl-2">Your Teams</div>
        <button class="absolute top-0 right-0 mt-0 mr-2 underline text-[#f6635c] pointer-events-auto z-30" on:click={() => signOut({callbackUrl:"/login"})}>Switch Account</button>
    </div>
    {#each data.teams as team, i}
        {#if currentTeamIndex != i}
            <button class=" active:scale-95  hover:scale-105 transition-all duration-200 shadow-md relative flex items-center justify-center p-2 bg-white whitespace-normal whitespace-pre-wrap leftbaritem rounded-lg h-[70px] bg-opacity-70" on:click={ async () => { currentTeamIndex = i; closeMenu() }}>
                <div class= " absolute m-auto lg:hidden text-black">
                    {team.name.length > 15 ? team.name.substring(0,15) + "..." : team.name}
                </div>
                <div class= " absolute m-auto max-lg:hidden text-black">
                    {team.name.length > 25 ? team.name.substring(0,25) + "..." : team.name}
                </div>
            </button>
        {:else}
            <div class="  shadow-md relative flex items-center justify-center p-2 bg-[#0ebaaa] whitespace-normal whitespace-pre-wrap leftbaritem rounded-lg h-[70px] bg-opacity-70">
                <div class= " absolute m-auto lg:hidden text-white ">
                    {team.name.length > 15 ? team.name.substring(0,15) + "..." : team.name}
                </div>
                <div class= " absolute m-auto max-lg:hidden text-white ">
                    {team.name.length > 25 ? team.name.substring(0,25) + "..." : team.name}
                </div>
            </div>
        {/if}
    {/each}
    <button class=" active:scale-95  hover:scale-105 transition-all duration-200 bg-white leftbaritem rounded-lg h-[70px] bg-opacity-70 font-extralight shadow-md" on:click={() => {currentTeamIndex = -2; closeMenu()}}>
        + Create or Join a team
    </button>
</div>

<!-- end- Modile menu -->
<div class=" w-screen flex flex-row">
    <div class=" max-md:hidden relative overflow-y-hidden overflow-x-clip  leftbar mt-[20px] rounded-lg left-[10px]  items-start w-screen md:w-[40%] bg-opacity-40 bg-white lg:w-[30%] xl:w-[25%]">
        <button class="absolute top-0 right-0 mt-2 mr-2 underline text-[#f6635c] pointer-events-auto z-30" on:click={() => signOut({callbackUrl:"/login"})}>Switch Account</button>
        <div class="relative bg-clip-text w-full h-[40px] border-b-2 border-blue-100  mb-2 text-transparent bg-gradient-to-bl from-[#f6635c] to-[#f6635c] pl-4 pt-2">Your Teams</div>
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
                    <div class="  shadow-md relative flex items-center justify-center p-2 bg-[#0ebaaa] whitespace-normal whitespace-pre-wrap leftbaritem rounded-lg h-[70px] bg-opacity-70">
                        <div class= " absolute m-auto lg:hidden text-white ">
                            {team.name.length > 15 ? team.name.substring(0,15) + "..." : team.name}
                        </div>
                        <div class= " absolute m-auto max-lg:hidden text-white ">
                            {team.name.length > 25 ? team.name.substring(0,25) + "..." : team.name}
                        </div>
                    </div>
                {/if}
            {/each}
            <button class=" active:scale-95  hover:scale-105 transition-all duration-200 bg-white leftbaritem rounded-lg h-[70px] bg-opacity-70 font-extralight shadow-md" on:click={() => {currentTeamIndex = -2}}>
                + Create or Join a team
            </button>
        </div>


    </div>

    <div class="rightsidediv bg-white bg-opacity-40 rounded-lg">
        {#if currentTeamIndex >= 0}
            <div class=" h-full overflow-clip">
                <div class=" relative bg-clip-text w-full h-[40px] border-b-2 border-blue-100  text-transparent bg-gradient-to-bl from-[#f6635c] to-[#f6635c] pl-4 pt-2">
                    <button class="absolute z-[35] top-0 left-0 md:hidden " on:click={openMenu}>
                        <img class="relative  bg-white bg-opacity-40 hover:bg-opacity-10 active:scale-105 transition-all duration-200 p-1 rounded-lg box-content mt-1 ml-1" src={menuburger} width="20px" height="20px">
                    </button>
                    <span class="max-md:ml-[23px]">{data.teams[currentTeamIndex].name}</span>
                </div>

                <div class=" px-4 py-2 bg-gradient-to-bl from-[#f6635c] to-[#f6635c] bg-clip-text text-transparent">
                    {#if currentTeam.owner != data.user.email}
                        <span class="font-normal">Owned by</span> {currentTeam.ownername} ({currentTeam.owner})
                    {:else}
                        <span class="font-normal">Owned by </span> <span class="  font-bold "> you.</span>
                    {/if}
                    <br>
                    {#if currentTeam.allowjoin}
                        <span class="font-normal">Invite people using </span> <button on:click = {() => {navigator.clipboard.writeText(new URL("/invite/"+ currentTeam.joincode.toUpperCase() + "/", window.location.origin).toString()); copytext = "Copied!"; setTimeout(() => {copytext = "Click to Copy!"}, 1000)}} class=" relative ctcbtn font-bold text-[#f6635c]">this link.<span class="tooltip pointer-events-none bg-black bg-opacity-70 text-white absolute left-0 whitespace-nowrap -translate-y-[30px] p-1 rounded-md">{copytext}</span></button> <br class="md:hidden">(Invite code: <span class="select-text font-bold">{currentTeam.joincode}</span>)
                    {:else}
                        The team is not accepting new members.
                    {/if}
                    <br>
                    <span class="font-normal"> Competing in </span> <span class="font-bold"> {eventArr[currentTeam.event] || currentTeam.event}</span>
                </div>


                <div class="relative flex flex-col overflow-hidden h-full">
                    <div class="bg-clip-text w-full h-[40px] border-b-2 border-blue-100 text-transparent bg-gradient-to-bl from-[#f6635c] to-[#f6635c] pl-4 pt-2">Members</div>
                    <div class=" h-full pb-[200px] noscrollbar overflow-auto ">
                        <div class=" p-4 mt-3  noscrollbar h-fit gap-2 w-full grid grid-cols-2 max-md:grid-cols-1 mb-[100px] ">
                            {#each currentTeam.members as member , i}

                                <div class=" overflow-y-auto overflow-x-clip relative bg-white w-full px-4 py-2 text-black h-[100px] rounded-lg shadow-xl">
                                    <div class=" absolute mx-auto h-full left-0 top-0 w-fit flex items-center justify-center pl-4">
                                        <div>
                                            <span class=" font-bold ">{member.name}</span>
                                            <br>
                                            <span class="font-extralight">{member.email}</span>
                                        </div>
                                    </div>
                                    <div class=" absolute overflow-x-visible h-full right-0 top-0 pr-4 w-fit flex items-center justify-center">
                                        {#if member.email === currentTeam.owner}
                                            <div class="ctcbtn w-fit">
                                                <img class="relative pr-1 box-content" src={crown} width="20px" height="20px">

                                                <span class=" tooltip pointer-events-none bg-black bg-opacity-70 text-white absolute  whitespace-nowrap p-1 -translate-x-[60px] -translate-y-[25px] rounded-md">Owner</span>
                                            </div>

                                        {:else if member.email === data.user.email}
                                            <form id={"kickselfform" + i} hidden method="POST">
                                                <input name="email" type="text" value={member.email} hidden>
                                                <input name="_id" type="text" value={currentTeam._id} hidden>
                                            </form>
                                            <button form={"kickselfform" + i} type="submit" class="ctcbtn" ><span class="tooltip pointer-events-none bg-black bg-opacity-70 text-white absolute left-0 whitespace-nowrap p-1 -translate-x-[60px] -translate-y-[2px] rounded-md">Leave</span><img class="relative  bg-black bg-opacity-0 hover:bg-opacity-10 active:scale-105 transition-all duration-200 p-1 rounded-lg box-content" src={leave} width="20px" height="20px"></button>
                                        {:else if currentTeam.owner === data.user.email}
                                            <form id={"kickform" + i} hidden method="POST">
                                                <input name="email" type="text" value={member.email} hidden>
                                                <input name="_id" type="text" value={currentTeam._id} hidden>
                                            </form>
                                            <button form={"kickform" + i} type="submit" class="ctcbtn" ><span class="tooltip pointer-events-none bg-black bg-opacity-70 text-white absolute left-0 whitespace-nowrap p-1 -translate-x-[115px] rounded-md">Kick member</span><img class="relative  bg-black bg-opacity-0 hover:bg-opacity-10 active:scale-105 transition-all duration-200 p-1 rounded-lg box-content" src={xmark} width="20px" height="20px"></button>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        {:else if currentTeamIndex === -2}
            <div class=" relative h-full w-full flex items-center justify-center">
                <button class="absolute z-[35] top-0 left-0 md:hidden " on:click={openMenu}>
                    <img class="relative  active:scale-105 transition-all duration-200 p-1 rounded-lg box-content mt-1 ml-1" src={menuburger} width="25px" height="25px">
                </button>
                <div class="relative h-fit w-fit">
                    <div class="text-black text-opacity-40 w-full text-lefts text-2xl flex flex-col items-center justify-center">
                        <div class="relative flex-nowrap flex w-fit pointer-events-none bg-black bg-opacity-0 focus-within:bg-opacity-20 border-white border-b-2 rounded-t-md transition-all duration-200 focus-within:border-blue-500 flex-row">
                            <input type="text" size="11" bind:value={invcode} placeholder="Invite Code" class=" font-bold w-fit whitespace-nowrap pointer-events-auto tbox bg-opacity-0 bg-black p-2 text-left placeholder-[#f6635c]" on:keyup={hitkey}  maxlength="6">
                            <button class="absolute right-0 align-middle top-[50%] translate-y-[-50%] pointer-events-auto mr-0.5" on:click={() => {hitkey({bypass:true})}}>
                                <img class="relative  bg-black bg-opacity-0 hover:bg-opacity-10 active:scale-105 transition-all duration-200 p-1 rounded-lg box-content" src={enterarrow} width="20px" height="20px">
                            </button>
                        </div>
                    </div>
                    <div class=" mt-2 w-full text-center text-black text-opacity-40">
                        or
                    </div>
                    <a href="#" class="absolute  text-[#f6635c] translate-y-8 bottom-0 w-full text-center text-2xl underline">Create a team</a>
                </div>
            </div>
        {:else}
            <div class=" relative h-full w-full flex items-center justify-center">
                <button class="absolute z-[35] top-0 left-0 md:hidden " on:click={openMenu}>
                    <img class="relative  active:scale-105 transition-all duration-200 p-1 rounded-lg box-content mt-1 ml-1" src={menuburger} width="25px" height="25px">
                </button>
                <div class=" h-fit w-fit">
                    <span class=" text-black text-opacity-40 text-2xl">
                        Select a team from the menu
                    </span>
                </div>
            </div>
        {/if}
    </div>
</div>


<style>
    .overlayblur{
        backdrop-filter: blur(12px);
    }
    .ctcbtn:hover > .tooltip{
        opacity: 1;
    }

    div > .tbox:hover  div{
        border-color: #88ecfd;
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

    .tbox{
        outline: none;
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