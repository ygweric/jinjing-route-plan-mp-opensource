// eslint-disable-next-line import/no-unresolved
import Components from 'unplugin-vue-components/webpack';
// eslint-disable-next-line import/no-unresolved
import { UnifiedWebpackPluginV5 } from 'weapp-tailwindcss/webpack';
import path from 'path';

const NutUIResolver = () => {
  // eslint-disable-next-line consistent-return
  return (name) => {
    if (name.startsWith('Nut')) {
      const partialName = name.slice(3);
      return {
        name: partialName,
        from: '@nutui/nutui-taro',
        sideEffects: `@nutui/nutui-taro/dist/packages/${partialName.toLowerCase()}/style`,
      };
    }
  };
};

const config = {
  projectName: 'jinjingCamera',
  date: '2024-3-22',
  designWidth(input) {
    if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1) {
      return 375;
    }
    return 750;
  },
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html'],
  defineConstants: {},
  copy: {
    patterns: [
      //  相对根目录
      { from: './assets', to: './dist/assets' },
    ],
    options: {},
  },
  framework: 'vue3',
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false },
  },
  cache: {
    enable: true, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  sass: {
    resource: [
      path.resolve(__dirname, '..', 'assets/styles/custom_theme.scss'),
    ],
    data: `@import "@nutui/nutui-taro/dist/styles/variables.scss";`,
  },
  alias: {
    // 不能用@, 会影响下卖弄的@/xxx
    '@/src': path.resolve(__dirname, '../src'),
    '@/utils': path.resolve(__dirname, '../src/utils'),
    '@/images': path.resolve(__dirname, '../src/assets/images'),
  },
  mini: {
    webpackChain(chain) {
      chain.plugin('unplugin-vue-components').use(
        Components({
          resolvers: [NutUIResolver()],
        })
      );
      chain.merge({
        plugin: {
          install: {
            plugin: UnifiedWebpackPluginV5,
            args: [
              {
                appType: 'taro',
              },
            ],
          },
        },
      });
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          // selectorBlackList: ['nut-']
        },
      },
      url: {
        enable: true,
        config: {
          limit: 1024, // 设定转换尺寸上限
        },
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true,
    },
  },
  h5: {
    webpackChain(chain) {
      chain.plugin('unplugin-vue-components').use(
        Components({
          resolvers: [NutUIResolver()],
        })
      );
    },
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['nutui-taro', 'icons-vue-taro'],
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
};

console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    return merge({}, config, require('./dev'));
  }
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  return merge({}, config, require('./prod'));
};
