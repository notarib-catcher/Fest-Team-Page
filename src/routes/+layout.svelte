<script>
    import "../app.css";
    import SURGE from "../assets/SURGE-noFLKTXT.webp"
</script>

<slot />
<div class="fixed bottom-0 right-0 z-0 pointer-events-none">
    <img src={SURGE} class="mr-2 mb-2 opacity-50" width="80px">
</div>