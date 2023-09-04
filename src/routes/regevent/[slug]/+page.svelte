<script>
    import {signOut} from "@auth/sveltekit/client";

    export let data
    import profileicon from "../../../assets/id-card-solid.svg"


</script>

<div class="fixed -z-50 left-0 top-0 w-[100dvw] h-[100dvh] bg-gradient-to-bl from-[#fe786f] to-[#f9baa8]">
</div>



<div class="w-[80dvw] h-[100dvh] max-w-[300px] flex items-center justify-center flex-col mx-auto">
    <div class=" w-fit h-fit items-center justify-center flex flex-col bg-black bg-opacity-30 p-4 rounded-lg">
        <div class=" w-fit pr-4 flex flex-row h-fit py-4 bg-black bg-opacity-20 rounded-md">
            <div class="flex h-full items-center justify-center px-2">
                <img src={profileicon} width="40px" height="40px">
            </div>
            <div class="flex gap-2 items-center text-white flex-row text-sm">
                <div>
                    <span class="font-extrabold ">NAME</span>
                    <br>
                    <span class="">PHONE</span>
                </div>
            </div>
        </div>
        <form method="POST">
            <input name="eventid" value={"aneventid"} hidden>
            <input type="submit" value="Register" class="font-bold w-[100px] bg-black bg-opacity-30 rounded-md p-2 mt-4 text-white hover:scale-105 active:scale-95 transition-all duration-200">
        </form>
        <span class="text-center mt-4 text-xs font-bold text-white">
        To register you, we will share your profile with the event's organisers.
    </span>
        <a href={"#"} class="font-xs underline italic text-white mt-2">I don't want to register</a>
        <button class="bg-black bg-opacity-20 p-1 rounded-md mt-4 text-xs italic text-white" on:click={() => {signOut({callbackUrl:window.location.pathname})}}>
            Not you? Switch Account
        </button>
    </div>
</div>