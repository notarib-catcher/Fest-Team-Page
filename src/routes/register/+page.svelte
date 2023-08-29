<script>
    import {browser} from "$app/environment";
    import {onMount} from "svelte";

    let name
    let phnum
    let mbstudent
    let lrem
    let appnum
    let insname
    let regnum
    let submitbtn
    let constituent
    let lemail
    let outinstitute

    let invite = ""
    let regevent = ""

    $: validname = (name?.length > 5)
    $: validph = (phnum?.length === 10)
    $: validinstitute = (outinstitute?.length > 3 || mbstudent)
    $: validlearner = (lemail?.endsWith("@learner.manipal.edu") || !mbstudent)
    $: validregnum = (regnum?.length > 8 || !mbstudent)
    $: validconstituent = (constituent?.length > 0 || !mbstudent)
    onMount( ()=> {

        document.addEventListener('input', async ()=>{
            phnum = phnum.replaceAll(/[^0-9]/g,"")
        })

        document.addEventListener('input', async ()=>{
            regnum = regnum.replaceAll(/[^0-9]/g,"")

        })

        document.addEventListener('input', async ()=>{
            name = name.replaceAll(/[^A-Za-z\s]/g,"")
        })

        if(browser){
            setInterval(async () => {
                submitbtn.disabled = !(validname && validph && validregnum && validconstituent && validlearner && validinstitute)
            }, 100)

            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            invite = urlParams.get('invite')
            regevent = urlParams.get('regevent')
        }




    })
</script>

<div class="relative flex items-center justify-center w-[100dvw] h-[100dvh] bg-gradient-to-bl from-blue-500 to-purple-100">
    <div class="w-full h-full md:w-[50%] md:min-h-[50%] md:max-h-fit lg:w-[40%] xl:w-[30%]  flex items-center justify-center">
        <div class="login-box font-extralight">
            <form method="POST">
                <p class=" text-center text-white font-extrabold text-2xl mb-4">Create a Profile</p>
                <h2 class="font-extrabold">
                    Basic Info
                </h2>
                <div class="user-box">
                    <input name="name" bind:value={name} type="text" maxlength="90" required>
                    <label>
                        Name (As on College ID)<span class="text-red-600 " hidden={validname}>*</span>
                    </label>
                </div>
                <div class="user-box">
                    <input name="phone" bind:value={phnum}   pattern="\d*"  type="text" maxlength="10" required>
                    <label>
                        Phone number (With WhatsApp)<span class="text-red-600 " hidden={validph}>*</span>
                    </label>
                </div>



                <div>

                </div>
                <h2 class="font-extrabold">
                    {#if mbstudent}
                        Registration Details
                    {:else}
                        Institute Details
                    {/if}
                </h2>

                <input name="mbstudent"  class="mb-3" bind:checked={mbstudent} type="checkbox" id="mbstudent">
                <label for="mbstudent" class="text-white">Student of MAHE BLR?</label><br>

                <div class="user-box">
                    <input name="lremail" type="text" bind:this={lrem} bind:value={lemail} hidden={!mbstudent} required>
                    <label hidden={!mbstudent}>
                        Learner email
                    </label>
                </div>
                <div class="user-box">
                    <input name="regnum" type="text" bind:value={regnum}  bind:this={appnum} hidden={!mbstudent} maxlength="10" required>
                    <label hidden={!mbstudent}>
                        Registration Number
                    </label>
                </div>
                <div class="text-white">
                    <label hidden={!mbstudent}>
                        Constituent Unit:
                    </label>

                    <select class="focus:outline-0 focus-within:outline-0 transition-all duration-300 bg-black bg-opacity-20 p-2 rounded-md" name="maheconstituent" list="constituents" hidden={!mbstudent} bind:value={constituent} required>
                        <option value="">Select</option>
                        <option value="MIT">MIT</option>
                        <option value="SMI">SMI</option>
                        <option value="DLHS">DLHS</option>
                        <option value="DOC">DOC</option>
                        <option value="MLS">MLS</option>
                        <option value="TAPMI">TAPMI</option>
                        <option value="DPP">DPP</option>
                    </select>
                </div>
                <br hidden={!mbstudent}>

                <div class="user-box">
                    <input name="institute" type="text" bind:this={insname} bind:value={outinstitute} hidden={mbstudent} required>
                    <label hidden={mbstudent}>
                        Your Institute
                    </label>
                </div>



                <input type="submit" bind:this={submitbtn} value="Submit" class=" disabled:bg-transparent transition-all duration-200 text-white font-extrabold border-2 p-2 rounded-lg bg-white bg-opacity-0 hover:bg-opacity-20 focus:bg-opacity-20 active:bg-opacity-20 disabled:text-gray-400 disabled:border-gray-500" formnovalidate disabled>
                <div class=" font-extralight mt-4 text-xs text-white">
                    <span class="text-red-400 font-semibold">
                        <span class="underline font-extrabold">
                            Your college ID card will be verified before you are allowed to compete
                        </span>
                        <br>
                        Details cannot be modified once submitted.
                    </span>
                    <br>
                    Your name and gmail ID will be shown to your team members to help them identify you.
                    <br>
                    Your other details will be shared with the organisers of MITB FALAK (SURGE) 2023.
                </div>
                {#if invite && invite !== ""}
                    <input type="text" name="invite" value={invite} hidden>
                {/if}
                {#if regevent && regevent !== ""}
                    <input type="text" name="regevent" value={regevent} hidden>
                {/if}
            </form>
        </div>
    </div>
</div>

<style>

    select > option{
        color: black;
    }
    .login-box h2 {
        margin: 0 0 10px;
        padding: 0;
        color: #fff;
    }

    .login-box {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 350px;
        padding: 40px;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,.5);
        box-sizing: border-box;
        box-shadow: 0 15px 25px rgba(0,0,0,.6);
        border-radius: 10px;
    }


    .login-box .user-box {
        position: relative;
    }

    .login-box .user-box input {
        width: 100%;
        padding: 10px 0;
        font-size: 16px;
        color: #fff;
        margin-bottom: 30px;
        border: none;
        border-bottom: 1px solid #fff;
        outline: none;
        background: transparent;
    }
    .login-box .user-box label {
        position: absolute;
        top:0;
        left: 0;
        padding: 10px 0;
        font-size: 16px;
        color: #fff;
        pointer-events: none;
        transition: .5s;
    }


    .login-box .user-box input:active ~ label{
        top: -20px;
        left: 0;
        color: #ff77ae;
        font-size: 12px;
    }

    .login-box .user-box input:focus ~ label{
        top: -20px;
        left: 0;
        color: #ff77ae;
        font-size: 12px;
    }

    .login-box .user-box input:valid ~ label{
        top: -20px;
        left: 0;
        color: #88ecfd;
        font-size: 12px;
    }



</style>