<template>
  <scroll-view class="page-con w-full h-full bg-white">
    <view class="w-full h-full flex items-center flex-col gap-y-8 mt-8">
      <view
        v-for="info in cameraInfoList"
        :key="info.name"
        class="w-full flex items-start flex-row gap-x-2"
      >
        <image
          class="w-8 h-8 ml-4"
          mode="aspectFit"
          :src="`/assets/images/poi/${info.name}.png`"
        />
        <view class="flex-1 mr-4 ml-2">{{ info.desc }}</view>
      </view>
      <view class="m-4 text-red-500">
        摄像头信息没有官方数据，每天都会新增、删除，所以规划前路请二次确认哦
      </view>
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
  const cameraInfoList = [
    {
      name: 'inner6Actived',
      desc: '精确位置：根据违章文字描述地点结合附近网友确认、街景、实地照片放置的精确位置',
    },
    {
      name: 'inner6MaybePos',
      desc: '大概位置：仅根据违章信息文字描述的地点放置的位置。与实际位置可能存在一些误差。但不会差太多。',
    },
    {
      name: 'unknow',
      desc: '网上有摄像头信息，但众说纷纭，无法确认',
    },
    {
      name: 'inner6MaybeActive',
      desc: '不确定，或者已经拆除等',
    },
    {
      name: 'outer6',
      desc: '六环外，只需要办理六环外进京证（目前没有次数限制）',
    },
  ];
</script>

<style lang="scss"></style>
