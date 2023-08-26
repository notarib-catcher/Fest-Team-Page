<script>
    import {signIn} from "@auth/sveltekit/client";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";
    onMount(() => {
        if(browser){
            signIn('google',{callbackUrl:"/"})
        }
    })
</script>