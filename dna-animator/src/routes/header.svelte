<!--The global header for DNA Animator-->
<script lang="ts">
	import { asset, assets } from "$app/paths";
    import logo from "$lib/assets/DNA Animator Logo.svg"

</script>

<nav class="navbar">
    <a href="/"><img class="logo-icon" src="{logo}" alt="logo" /></a>
    <button class="navbar-button"><span>File</span></button>
    <button class="navbar-button"><span>Edit</span></button>
    <button class="navbar-button"><span>View</span></button>
    <button class="navbar-button"><span>Options</span></button>
</nav>

<style>
    .navbar {
        display: flex;
        align-items: center;
        position: fixed;
        top: 0;
        width: 100%;
        height: 35px;
        background-color: var(--bg-light);
        padding-left: 10px;
        box-shadow: black 0px -5px 10px;

        .logo-icon {
            width: 25px;
            height: 25px;
        }

        .navbar-button {
            padding: 2px;
            padding-left: 15px;
            padding-right: 15px;
            height: fit-content;
            border-radius: 4px;
            
            &:hover {
                background-color: var(--primary);

                span {
                    filter: invert(1);
                }
                
            }
        }
    }
</style>