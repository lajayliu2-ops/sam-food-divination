const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 星座数据
const zodiacData = {
    aries: { name: '白羊座', icon: '♈', element: '火', traits: '热情冲动' },
    taurus: { name: '金牛座', icon: '♉', element: '土', traits: '稳重务实' },
    gemini: { name: '双子座', icon: '♊', element: '风', traits: '机智多变' },
    cancer: { name: '巨蟹座', icon: '♋', element: '水', traits: '温柔敏感' },
    leo: { name: '狮子座', icon: '♌', element: '火', traits: '自信霸气' },
    virgo: { name: '处女座', icon: '♍', element: '土', traits: '追求完美' },
    libra: { name: '天秤座', icon: '♎', element: '风', traits: '优雅平衡' },
    scorpio: { name: '天蝎座', icon: '♏', element: '水', traits: '神秘深沉' },
    sagittarius: { name: '射手座', icon: '♐', element: '火', traits: '自由乐观' },
    capricorn: { name: '摩羯座', icon: '♑', element: '土', traits: '踏实坚韧' },
    aquarius: { name: '水瓶座', icon: '♒', element: '风', traits: '独立创新' },
    pisces: { name: '双鱼座', icon: '♓', element: '水', traits: '浪漫梦幻' }
};

// 每日运势缓存
const dailyFortuneCache = new Map();

// 获取今日日期字符串
function getTodayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// 菜品库
const dishes = [
    { 
        name: '泰式青柠鲈鱼', 
        desc: '酸辣开胃，清爽解腻', 
        element: '水',
        emoji: '🐟',
        story: '相传泰国渔夫出海前，妻子必做此菜。青柠的酸能驱散海上的腥气，鱼肉的鲜寓意丰收归来。如今这道菜成了泰国国宴名菜，每一口都是海洋的馈赠。',
        restaurants: [
            { name: '泰香米泰国餐厅', address: '深圳海岸城L5层', price: '人均120元', phone: '0755-86359888' },
            { name: '蕉叶泰国餐厅', address: '深圳万象城L4层', price: '人均150元', phone: '0755-82668488' },
            { name: 'SOI 22 二十二象', address: '深圳福田卓越中心', price: '人均100元', phone: '0755-23994622' }
        ]
    },
    { 
        name: '广式烧鹅', 
        desc: '皮脆肉嫩，经典粤味', 
        element: '火',
        emoji: '🦆',
        story: '南宋末年，御厨随皇室南迁，将宫廷烤鸭技艺带到广东。因岭南多鹅少鸭，便改良为烧鹅。深井烧鹅更是用上等荔枝木烤制，皮脆如纸，肉嫩多汁，是深圳人宴请宾客的首选。',
        restaurants: [
            { name: '炳胜品味', address: '深圳福田中心区福华路', price: '人均180元', phone: '0755-82808888' },
            { name: '深井陈记烧鹅', address: '深圳南山区南海大道', price: '人均80元', phone: '0755-26488888' },
            { name: '镛记烧鹅', address: '深圳罗湖万象城', price: '人均200元', phone: '0755-82668888' }
        ]
    },
    { 
        name: '台式卤肉饭', 
        desc: '香浓入味， comfort food 首选', 
        element: '土',
        emoji: '🍚',
        story: '清末福建移民将卤肉技艺带到台湾。早期台湾商人为了节省时间，将卤肉切丁拌饭，方便边做生意边吃。一碗卤肉饭，承载着台湾人的乡愁与奋斗史，是深漂族最熟悉的家乡味。',
        restaurants: [
            { name: '胡须张鲁肉饭', address: '深圳华强北九方购物中心', price: '人均50元', phone: '0755-82558888' },
            { name: '台南担仔面', address: '深圳东门步行街', price: '人均60元', phone: '0755-82228888' },
            { name: '阿嬷台湾料理', address: '深圳南山海岸城', price: '人均70元', phone: '0755-86758888' }
        ]
    },
    { 
        name: '日式拉面', 
        desc: '汤头浓郁，暖胃暖心', 
        element: '水',
        emoji: '🍜',
        story: '1910年，日本横滨中华街出现了第一碗拉面。大正时代的日本，拉面是劳工阶层的能量来源。如今一碗好的拉面，需要熬制12小时以上的骨汤，配上溏心蛋，是加班后最好的慰藉。',
        restaurants: [
            { name: '一兰拉面', address: '深圳万象天地L1层', price: '人均100元', phone: '0755-86668888' },
            { name: '博多一幸舍', address: '深圳COCO Park B1层', price: '人均90元', phone: '0755-82558888' },
            { name: '面屋武藏', address: '深圳福田皇庭广场', price: '人均85元', phone: '0755-23998888' }
        ]
    },
    { 
        name: '川味火锅', 
        desc: '麻辣鲜香，聚会首选', 
        element: '火',
        emoji: '🍲',
        story: '长江边的船工和纤夫，为了驱寒祛湿，将各种食材放入沸汤中涮煮，这便是火锅的雏形。重庆码头文化孕育了九宫格火锅，麻辣之中藏着江湖义气。在深圳，火锅是异乡人最快的交友方式。',
        restaurants: [
            { name: '海底捞火锅', address: '深圳各区均有分店', price: '人均150元', phone: '400-888-8888' },
            { name: '大龙燚火锅', address: '深圳福田中心城L3层', price: '人均130元', phone: '0755-82558888' },
            { name: '蜀大侠火锅', address: '深圳南山海岸城L4层', price: '人均120元', phone: '0755-86758888' }
        ]
    },
    { 
        name: '越南河粉', 
        desc: '清淡鲜美，健康之选', 
        element: '风',
        emoji: '🍜',
        story: '19世纪法国殖民时期，越南人学会了用牛骨熬汤。河粉（Pho）源自广东河粉，却融入了法式炖汤的精髓。清晨一碗Pho，配上九层塔和青柠，是越南人开启一天的方式，也是深圳白领的轻食首选。',
        restaurants: [
            { name: '美奈小馆', address: '深圳海岸城L5层', price: '人均80元', phone: '0755-86359888' },
            { name: '越小品', address: '深圳中心城B1层', price: '人均70元', phone: '0755-82558888' },
            { name: '芽笼芽笼新加坡餐厅', address: '深圳万象天地L4层', price: '人均90元', phone: '0755-86668888' }
        ]
    },
    {
        name: '北京烤鸭',
        desc: '皮脆肉嫩，宫廷御膳',
        element: '火',
        emoji: '🦆',
        story: '北京烤鸭起源于南北朝时期，曾是宫廷御膳。明代迁都北京后，烤鸭技艺得到进一步发展。选用优质北京填鸭，经果木炭火烤制，色泽红润，肉质肥而不腻，外脆里嫩，被誉为"天下美味"。',
        restaurants: [
            { name: '大董烤鸭', address: '深圳福田中心城L4层', price: '人均300元', phone: '0755-82558888' },
            { name: '全聚德', address: '深圳南山海岸城L5层', price: '人均200元', phone: '0755-86758888' },
            { name: '便宜坊', address: '深圳罗湖万象城L3层', price: '人均180元', phone: '0755-82668888' }
        ]
    },
    {
        name: '潮汕牛肉火锅',
        desc: '鲜嫩爽滑，原汁原味',
        element: '水',
        emoji: '🥩',
        story: '潮汕人对牛肉的讲究到了极致，一头牛只取37%的肉用来涮火锅。牛肉现切现涮，三起三落，蘸上沙茶酱，入口即化。这是潮汕人待客的最高礼仪，也是深圳人深夜食堂的首选。',
        restaurants: [
            { name: '八合里海记', address: '深圳福田车公庙', price: '人均120元', phone: '0755-82558888' },
            { name: '大牛火锅', address: '深圳南山科技园', price: '人均100元', phone: '0755-86758888' },
            { name: '潮牛庄', address: '深圳罗湖东门', price: '人均90元', phone: '0755-82228888' }
        ]
    },
    {
        name: '意大利披萨',
        desc: '薄底香脆，芝士拉丝',
        element: '火',
        emoji: '🍕',
        story: '那不勒斯是披萨的故乡。1889年，厨师为玛格丽特王后制作了以番茄、马苏里拉芝士和罗勒为原料的披萨，代表意大利国旗三色。正宗的那不勒斯披萨必须在石窑中以485度高温烤制90秒。',
        restaurants: [
            { name: 'Pizza Marzano', address: '深圳万象天地L2层', price: '人均120元', phone: '0755-86668888' },
            { name: '乐凯撒披萨', address: '深圳各区均有分店', price: '人均80元', phone: '400-888-8888' },
            { name: '必胜客', address: '深圳各区均有分店', price: '人均70元', phone: '400-888-8888' }
        ]
    },
    {
        name: '韩式烤肉',
        desc: '滋滋作响，肉香四溢',
        element: '火',
        emoji: '🥓',
        story: '韩式烤肉源于古代高丽王朝的宫廷料理。选用优质牛肉，以梨汁、洋葱等腌制，在铁盘上烤至金黄，裹上生菜，配上蒜片和辣酱，一口下去是韩国人对美食的极致追求。',
        restaurants: [
            { name: '姜虎东白丁烤肉', address: '深圳福田COCO Park L3层', price: '人均150元', phone: '0755-82558888' },
            { name: '本家韩国料理', address: '深圳南山海岸城L4层', price: '人均130元', phone: '0755-86758888' },
            { name: '青瓦台韩国料理', address: '深圳罗湖东门', price: '人均100元', phone: '0755-82228888' }
        ]
    },
    {
        name: '法式牛排',
        desc: '外焦里嫩，汁水丰盈',
        element: '火',
        emoji: '🥩',
        story: '法式牛排讲究的是对火候的精准掌控。从蓝带到全熟，每一种熟度都有其独特的风味。搭配红酒酱汁，配上一杯波尔多红酒，是法国人浪漫生活的缩影，也是深圳约会餐厅的常客。',
        restaurants: [
            { name: '王品牛排', address: '深圳福田中心城L4层', price: '人均350元', phone: '0755-82558888' },
            { name: '西堤牛排', address: '深圳南山海岸城L5层', price: '人均200元', phone: '0755-86758888' },
            { name: '斗牛士牛排', address: '深圳罗湖万象城L3层', price: '人均180元', phone: '0755-82668888' }
        ]
    },
    {
        name: '港式茶餐厅',
        desc: '中西合璧，平民美食',
        element: '土',
        emoji: '🍳',
        story: '茶餐厅是香港特有的饮食文化，起源于二战后。冰室演变而来的茶餐厅，将西式简餐与中式口味融合，菠萝油、奶茶、公仔面，是几代香港人的集体记忆，也是深圳人的日常食堂。',
        restaurants: [
            { name: '翠华餐厅', address: '深圳福田中心城B1层', price: '人均70元', phone: '0755-82558888' },
            { name: '新旺茶餐厅', address: '深圳南山海岸城L4层', price: '人均60元', phone: '0755-86758888' },
            { name: '大家乐', address: '深圳各区均有分店', price: '人均50元', phone: '400-888-8888' }
        ]
    }
];

// 生成运势
function generateFortune(zodiac, birthDateTime) {
    const zodiacInfo = zodiacData[zodiac];
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    // 基于日期和星座计算运势等级
    const luckLevel = (day + month + zodiac.length) % 4;
    const levels = ['大吉', '中吉', '小吉', '吉'];
    const level = levels[luckLevel];
    
    // 生成宜忌
    const yiList = ['尝试新菜', '外出就餐', '清淡饮食', '与朋友聚餐', '品尝甜品', '喝下午茶'];
    const jiList = ['快餐凑合', '生冷食物', '油腻辛辣', '暴饮暴食', '独自用餐', '深夜食堂'];
    
    const yi = yiList[(day + luckLevel) % yiList.length];
    const ji = jiList[(month + luckLevel) % jiList.length];
    
    // 生成运势内容
    const contents = {
        '大吉': `今日${zodiacInfo.name}食神高照！${zodiacInfo.traits}的你，味蕾格外敏锐。适合大胆尝试从未吃过的菜系，会有意外惊喜。`,
        '中吉': `${zodiacInfo.name}今日食运平稳。${zodiacInfo.traits}的特质让你更偏爱熟悉的味道，经典餐厅是最佳选择。`,
        '小吉': `${zodiacInfo.name}今日宜清淡。${zodiacInfo.element}象星座的你，适合温润滋补的食物，调理肠胃。`,
        '吉': `今日${zodiacInfo.name}食神指路。${zodiacInfo.traits}的你，适合${zodiacInfo.element}象星座对应的口味，会有好运。`
    };
    
    return {
        title: level,
        content: contents[level],
        yi: yi,
        ji: ji,
        luckyColor: ['红色', '金色', '绿色', '蓝色'][luckLevel],
        luckyNumber: (day % 9) + 1,
        direction: ['东南', '西北', '正南', '东北'][luckLevel]
    };
}

// API: 获取运势
app.post('/api/fortune', (req, res) => {
    const { zodiac, birthDateTime } = req.body;
    
    if (!zodiac || !birthDateTime) {
        return res.status(400).json({ error: '缺少参数' });
    }
    
    // 检查缓存（同一天同一星座运势不变）
    const today = getTodayKey();
    const cacheKey = `${today}-${zodiac}`;
    
    if (dailyFortuneCache.has(cacheKey)) {
        const cached = dailyFortuneCache.get(cacheKey);
        return res.json({
            fortune: cached.fortune,
            dish: cached.dish,
            zodiac: zodiacData[zodiac],
            cached: true
        });
    }
    
    const fortune = generateFortune(zodiac, birthDateTime);
    
    // 根据星座元素和运势选择菜品
    let recommendedDish;
    const zodiacElement = zodiacData[zodiac].element;
    
    if (fortune.title === '大吉') {
        // 大吉：推荐与星座元素相生的菜品
        const compatibleElements = {
            '火': '风',
            '风': '火',
            '水': '土',
            '土': '水'
        };
        const targetElement = compatibleElements[zodiacElement];
        const compatibleDishes = dishes.filter(d => d.element === targetElement);
        recommendedDish = compatibleDishes[Math.floor(Math.random() * compatibleDishes.length)];
    } else if (fortune.title === '小吉') {
        // 小吉：推荐与星座元素相同的菜品
        const sameElementDishes = dishes.filter(d => d.element === zodiacElement);
        recommendedDish = sameElementDishes[Math.floor(Math.random() * sameElementDishes.length)];
    } else {
        // 其他：随机推荐
        recommendedDish = dishes[Math.floor(Math.random() * dishes.length)];
    }
    
    const result = {
        fortune,
        dish: recommendedDish,
        zodiac: zodiacData[zodiac]
    };
    
    // 存入缓存
    dailyFortuneCache.set(cacheKey, result);
    
    res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Vercel serverless export
module.exports = app;
