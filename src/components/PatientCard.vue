<template>
  <div>
    <div>
      <p>{{cardBemor.id}}</p>
      <h2>{{ cardBemor.familiya  }}</h2>
      <h2>
        {{cardBemor.ism}}
      </h2>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      cardBemor: {},
      loading: true
    };
  },
  methods: {
    async getIdbemor() {
      try {
        const res = await api.get(`/api/v1/clients/${this.$route.params.id}`);
        this.cardBemor = res.data; // ✅ Faqat data qismini olamiz
        console.log("Bemor:", this.cardBemor);
      } catch (err) {
        console.error("API xatolik:", err);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.getIdbemor();
  }
};
</script>

<style lang="scss" scoped></style>
