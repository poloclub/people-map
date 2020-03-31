<script>
  var choices = [
    "Artificial Intelligence",
    "Natural Language Processing",
    "Computer Vision",
    "Human Computer Interaction",
    "Deep Learning",
    "Machine Learning"
  ]

  var handleInterestSelect = (choice) => {
    console.log(choice)
  }

</script>

<style>
  .panel-heading{
      background: #C0C0C0;
  }
  .panel-block{
      background: #F5F5F5;
  }
</style>

<nav class="panel">
  <p class="panel-heading">
    Research Topic Search
  </p>
  <div class="panel-block">
    <p class="control has-icons-left">
      <input class="input" type="text" placeholder="Search">
      <span class="icon is-left">
        <i class="fas fa-search" aria-hidden="true"></i>
      </span>
    </p>
  </div>
  {#each choices as choice}
    <a on:click = {() => { handleInterestSelect(choice) }} class="panel-block">
      <span class="panel-icon">
        <i class="fas fa-book" aria-hidden="true"></i>
      </span>
      {choice}
    </a>
  {/each}
</nav>