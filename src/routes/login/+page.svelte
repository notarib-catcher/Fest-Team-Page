<script>
    import {signIn} from "@auth/sveltekit/client";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";
    onMount(() => {
        if(browser){
            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            const invite = urlParams.get('invite')
            const regevent = urlParams.get('regevent')
            const createteam = urlParams.get('createteam')
            signIn('google',{callbackUrl:(invite?"/invite/"+invite:(regevent?"/regevent/"+regevent:(createteam?"/create/"+createteam:"/")))})
        }
    })
</script>