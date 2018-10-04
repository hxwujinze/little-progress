//index.js
//获取应用实例
const app = getApp()
var WXBizDataCrypt = require('../../utils/RdWXBizDataCrypt.js');
var promisify = require('../../utils/promise.util.js');
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    pace: 0,
    list: [],
    openid: "",
    donate: 0,
    donateall:0,
    all: 0,
    animationData: {},
    aniFromLeft: {},
    aniFromRight: {},
    modalHidden: true,
    rank:0

  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  /**
   * 点击取消
   */
  modalCandel: function () {
    // do something
    this.setData({
      modalHidden: true
    })
  },
  /**
   *  点击确认
   */
  modalConfirm: function () {
    // do something
    this.setData({
      modalHidden: true
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {

      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    var that = this;
    wx.login({
      success: function (res) {
        var appid = "wx4c8d9be73e1a8c91";
        var secret = "0dd803daa8b29bd6651ba2cfc8ffea89";
        //var appid = "wxf1320ed2a1e7f7b4";
        //var secret = "1a76bb0084e00a520a1eba70bc67c4f6";
        if (res.code) {
          wx.request({
            url: 'https://www.chekehome.com/wujinzeworkplace/api.php?action=session',
            data:{
              'url': 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + res.code + '&grant_type=authorization_code',
            },
            header: {
              'content-type': 'json'
            },
            success: function (res) {
              console.log(res)
              app.globalData.openid = res.data.openid;
              var session_key = res.data.session_key;
              that.getData(appid, session_key);


            }
          })
        }
      }
    })


  },
  onReady: function () {

  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '助力活动，爱心接力',
      path: '/pages/index/index?id=123',
    }
  },
  generate: function (pace, all) {
    const wxGetImageInfo = promisify.promisify(wx.getImageInfo)
    var that = this;
    var width=0,height=0;
    Promise.all([
      wxGetImageInfo({
        src: '../../images/my.png'
      }),
      wxGetImageInfo({
        src: '../../images/share.png'
      })
    ]).then(res => {
      const ctx = wx.createCanvasContext('shareCanvas')
      // 底图
      ctx.drawImage(res[0].path, 0, 0, 300, 400)

      // 作者名称
      ctx.setTextAlign('center')    // 文字居中
      ctx.setFillStyle('#000000')  // 文字颜色：黑色
      ctx.setFontSize(15)         // 文字字号：22px
      ctx.fillText('已贡献' + pace + "距离目标剩余" + all, 300 / 2, 250)

      // 小程序码
      const qrImgSize = 80
      ctx.drawImage(res[1].path, 0, 0, qrImgSize, qrImgSize)

      ctx.stroke()
      ctx.draw()
    })
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success() {
        wx.getWeRunData({
          success: function (res) {
            const wxCanvasToTempFilePath = promisify.promisify(wx.canvasToTempFilePath)
            const wxSaveImageToPhotosAlbum = promisify.promisify(wx.saveImageToPhotosAlbum)

            wxCanvasToTempFilePath({
              canvasId: 'shareCanvas'
            }, this).then(res => {
              return wxSaveImageToPhotosAlbum({
                filePath: res.tempFilePath
              })
            }).then(res => {
              wx.showToast({
                title: '已保存到相册'
              })
            })
          },
          fail: function (res) {
            wx.showModal({
              title: '提示',
              content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
              showCancel: false,
              confirmText: '知道了'
            })
          }
        })
      }
    })



  },
  //获取encryptedData（没有解密的步数）和iv（加密算法的初始向量）
  getData: function (appid, session_key) {
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.werun']) {
          wx.showModal({
            title: '提示',
            content: '获取微信运动步数，需要开启计步权限',
            success: function (res) {
              if (res.confirm) {
                //跳转去设置
                wx.authorize({
                  scope: 'scope.werun',
                  success() {
                    wx.getWeRunData({
                      success: function (res) {
                        var encryptedData = res.encryptedData;
                        var iv = res.iv;
                        var pc = new WXBizDataCrypt(appid, session_key);
                        var data = pc.decryptData(encryptedData, iv);
                        var pace = data.stepInfoList[data.stepInfoList.length - 1]["step"];
                        that.setData({
                          pace: pace
                        })
                        app.globalData.pace = pace;
                        // that.join();
                      },
                      fail: function (res) {
                        wx.showModal({
                          title: '提示',
                          content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
                          showCancel: false,
                          confirmText: '知道了'
                        })
                      }
                    })
                  }
                })
              } else {
                //不设置
              }
            }
          })
        } else {
          wx.getWeRunData({
            success: function (res) {
              var encryptedData = res.encryptedData;
              var iv = res.iv;
              var pc = new WXBizDataCrypt(appid, session_key);
              var data = pc.decryptData(encryptedData, iv);
              var pace = data.stepInfoList[data.stepInfoList.length - 1]["step"];
              that.setData({
                pace: pace
              })
              app.globalData.pace = pace;
              //  that.join();
            },
            fail: function (res) {
              wx.showModal({
                title: '提示',
                content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
                showCancel: false,
                confirmText: '知道了'
              })
            }
          })
        }
      }
    })
    that.find();
  },
  find: function () {
    var that = this;
    wx.request({
      url: 'https://www.chekehome.com/wujinzeworkplace/api.php?action=find',
      data: {
        "id": app.globalData.openid,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        
        that.setData({
          list: res.data.user,
          all: res.data.totaldonate,
          donate:res.data.donatetoday,
          donateall:res.data.donate,
          rank:res.data.rank
        })
      },
      fail: function (res) {
     
      }
    })
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  join: function () {
    this.setData({
      modalHidden: false
    })
    var that = this;
    wx.request({
      url: 'https://www.chekehome.com/wujinzeworkplace/api.php?action=join',
      data: {
        "id": app.globalData.openid,
        "name": app.globalData.userInfo.nickName,
        "url": app.globalData.userInfo.avatarUrl,
        "pace": app.globalData.pace
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        
        that.setData({
          donate: res.data.user["donatetoday"],
          donateall:res.data.user["donate"],
        })
        that.generate(res.data.user["donate"], 100000 - that.data.all - res.data.user["pace"]);
      },
      fail: function (res) {
      }
    })
    that.find()
  },
  onShow: function () {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation
    setTimeout(function () {
      animation.translate(210).step()
      this.setData({
        aniFromLeft: animation.export()
      })
      animation.translate(-200).step()
      this.setData({
        aniFromRight: animation.export()
      })
    }.bind(this), 1000)
  },

})