<template>
  <div class="profile">
    <div>
      <b-card no-body class="overflow-hidden">
        <b-row no-gutters>
          <b-col md="6">
            <b-card-img src="https://picsum.photos/400/400/?image=20" alt="User's Image" class="rounded-0"></b-card-img>
          </b-col>
          <b-col md="6">
            <b-card-body title="Username">
              <b-card-text>
                This is a wider card with supporting text as a natural lead-in to additional content.
                This content is a little bit longer.
              </b-card-text>
            </b-card-body>
          </b-col>
        </b-row>
      </b-card>
    </div>
    <div class="data">
      <b-card no-body>
        <b-tabs v-model="tabIndex" card>
          <b-tab title="Tab 1" :title-link-class="linkClass(0)"><DataInfo /></b-tab>
          <b-tab title="Tab 2" :title-link-class="linkClass(1)"><MatchInfo /></b-tab>
        </b-tabs>
      </b-card>
    </div>
  </div>
</template>

<script>
import DataInfo from "@/components/profileComponents/DataInfo";
import MatchInfo from "@/components/profileComponents/MatchInfo";

export default {
  name: 'Profile',
  components: {
    DataInfo,
    MatchInfo
  },
  data() {
    return {
      tabIndex: 0
    }
  },
  methods: {
    linkClass(idx) {
      if (this.tabIndex === idx) {
        return ['bg-primary', 'text-light']
      } else {
        return ['bg-light', 'text-info']
      }
    }
  }
}
</script>

<style>
.overflow-hidden{
  padding: 3%;
}
.data {
  margin-top: 3%;
}
</style>