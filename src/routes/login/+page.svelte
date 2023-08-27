<script>
    import {signIn} from "@auth/sveltekit/client";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";
    onMount(() => {
        if(browser){
            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            const invite = urlParams.get('invite')
            signIn('google',{callbackUrl:(invite)?"/invite/"+invite:"/"})
        }
    })
</script>