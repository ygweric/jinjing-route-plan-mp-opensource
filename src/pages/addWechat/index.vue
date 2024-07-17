<template>
  <nut-toast
    :title="toastState.title"
    :msg="toastState.msg"
    v-model:visible="toastState.show"
    :type="toastState.type"
    :duration="toastState.duration"
  />
  <scroll-view class="page-con w-full h-full bg-white">
    <view class="w-full h-full flex items-center flex-col gap-y-2 mt-4">
      <nut-button type="primary" @click="copyWechatName">
        点击复制作者微信号 {{ wechatId }}
      </nut-button>
      <image class="w-3/4 h-[800px]" mode="aspectFit" :src="wxGroupImg" />
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
  import Taro from '@tarojs/taro';
  import { ToastType } from 'types';
  import { onMounted, reactive, ref } from 'vue';

  const toastState = reactive({
    msg: 'toast',
    type: 'text',
    show: false,
    cover: false,
    title: '',
    bottom: '',
    center: true,
    duration: 2000,
  });

  const wechatId = ref('ygweric');

  const wxGroupImg = ref('');

  const showToast = (type: ToastType, title, msg, duration = 2000) => {
    toastState.show = true;
    toastState.type = type;
    toastState.title = title;
    toastState.msg = msg;
    toastState.duration = duration;
  };

  const copyWechatName = () => {
    Taro.setClipboardData({
      data: wechatId.value,
      success(res) {
        showToast('success', '复制成功', `${wechatId.value}已复制到剪切板`);
      },
    });
  };

  onMounted(async () => {
    wxGroupImg.value = Taro.getCurrentInstance().router?.params
      .wxGroupImg as string;
  });
</script>

<style lang="scss"></style>
