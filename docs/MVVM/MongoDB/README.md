# MongoDB

## 下载安装

* 下载MongoDB直接去官网下载即可。
* 安装好之后，在data文件夹中新建db文件夹和logs文件夹。
* 配置环境变量 把bin目录配置到系统变量和用户变量中



命令行 输入 mongo --help有大量回复 说明成功 有描述 MongoDB shell version v4.0.13

然后配置数据路径和日志路径



指定数据库路径： mongod --dbpath D:\mongo\data\db

指定日志路径：mongo  --bind_ip 0.0.0.0 --logpath C



### 启动

首先执行bin下面的mongoxd.exe

然后 敲命令启动 mongod --dbpath "D:\mongo\data\db"




## 概念解析

| SQL概念     | MongoDB     | 说明                                |
| ----------- | ----------- | ----------------------------------- |
| database    | database    | 数据库                              |
| table       | collection  | 数据库表 / 集合                     |
| row         | document    | 数据记录行 / 文档                   |
| column      | field       | 数据字段/域                         |
| index       | index       | 索引                                |
| table joins |             | 表连接 MongoDB不支持                |
| primary key | primary key | 主键 MongoDB自动将_id字段设置为主键 |



## 数据库

数据库的名字可以是满足以下条件的任意 UTF-8字符串。

* 不能是空字符串（""）
* 不得有空格  、 $ / \ 和 空字符。
* 应全部小写
* 最多64字节



有一些数据库名是保留的，可以直接访问这些有特殊作用的数据库。

* admin 从权限角度来看。root数据库，要是将一个用户添加到这个数据库
* local 这个数据永远不会被复制 可以用来存储限于本地单台服务器的任意集合
* config 当 Mongo用于分片设置时，config数据库在内部使用，用于保存分片的相关信息





### MongoDB数据类型



| 数据类型           | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| String             | 字符串，存储数据常用的数据类型。在MongoDB中，UTF-8编码的字符串才是合法的 |
| Interger           | 整型数字 根据服务可以分32 和 64位                            |
| Boolean            | 布尔值 用于存储布尔值                                        |
| Double             | 双精度浮点值。用于存储浮点值                                 |
| Min/Max keys       | 将一个值与BSON（二进制的JSON）元素的最低值和最高值想=相对比  |
| Array              | 用于将数组或列表或多个值存储为一个键                         |
| TimeStamp          | 时间戳。记录文档修改或添加的具体时间                         |
| Object             | 用于内嵌文档                                                 |
| Null               | 用于创建空值                                                 |
| Symbol             | 符号。基本上等同于字符串。但是一般采用特殊符号类型的语言     |
| Date               | 日期时间 Unix时间格式来存储当前日期或时间 可以自己制定日期时间 |
| Object ID          | 对象ID 用于创建文档的ID                                      |
| Binary Data        | 二进制数据。用于存储二进制数据                               |
| Code               | 代码类型。用于在文档中存储JavaScript代码                     |
| Regular expression | 正则表达式类型。存储正则表达式                               |

​	

 ### ObjectID 

