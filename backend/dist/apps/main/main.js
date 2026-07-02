/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/main/src/app.controller.ts"
/*!*****************************************!*\
  !*** ./apps/main/src/app.controller.ts ***!
  \*****************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apps/main/src/app.service.ts");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async getCharacters(page = '1', limit = '20', search) {
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.max(1, parseInt(limit, 10) || 20);
        return this.appService.getCharacters(pageNumber, limitNumber, search);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get characters with pagination and optional search' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Text search by name' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], AppController.prototype, "getCharacters", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('Characters'),
    (0, common_1.Controller)('characters'),
    __metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ },

/***/ "./apps/main/src/app.module.ts"
/*!*************************************!*\
  !*** ./apps/main/src/app.module.ts ***!
  \*************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./apps/main/src/app.controller.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apps/main/src/app.service.ts");
const shared_1 = __webpack_require__(/*! @app/shared */ "./libs/shared/src/index.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot('mongodb://localhost:27017/lumana'),
            mongoose_1.MongooseModule.forFeature([{ name: shared_1.Character.name, schema: shared_1.CharacterSchema }]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ },

/***/ "./apps/main/src/app.service.ts"
/*!**************************************!*\
  !*** ./apps/main/src/app.service.ts ***!
  \**************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const shared_1 = __webpack_require__(/*! @app/shared */ "./libs/shared/src/index.ts");
const axios_1 = __webpack_require__(/*! axios */ "axios");
const JSONStream = __webpack_require__(/*! JSONStream */ "JSONStream");
const promises_1 = __webpack_require__(/*! stream/promises */ "stream/promises");
let AppService = class AppService {
    constructor(characterModel) {
        this.characterModel = characterModel;
        this.API_URL = 'https://rickandmortyapi.com/api/character';
        this.BATCH_SIZE = 50;
    }
    async onModuleInit() {
        const count = await this.characterModel.countDocuments();
        if (count === 0) {
            await this.downloadAndStreamData();
        }
    }
    async downloadAndStreamData() {
        try {
            const { data } = await axios_1.default.get(this.API_URL, { responseType: 'stream' });
            const jsonStream = JSONStream.parse('results.*');
            let batch = [];
            jsonStream.on('data', async (characterData) => {
                batch.push(characterData);
                if (batch.length >= this.BATCH_SIZE) {
                    jsonStream.pause();
                    await this.saveBatchToDB(batch);
                    batch = [];
                    jsonStream.resume();
                }
            });
            jsonStream.on('end', async () => {
                if (batch.length > 0) {
                    await this.saveBatchToDB(batch);
                }
            });
            await (0, promises_1.pipeline)(data, jsonStream);
        }
        catch (error) {
        }
    }
    async saveBatchToDB(batch) {
        try {
            await this.characterModel.insertMany(batch, { ordered: false });
        }
        catch (error) {
            if (error.code !== 11000) {
                throw error;
            }
        }
    }
    async getCharacters(page, limit, search) {
        const skip = (page - 1) * limit;
        const query = search ? { $text: { $search: search } } : {};
        const [data, total] = await Promise.all([
            this.characterModel.find(query).skip(skip).limit(limit).exec(),
            this.characterModel.countDocuments(query),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(shared_1.Character.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], AppService);


/***/ },

/***/ "./libs/shared/src/index.ts"
/*!**********************************!*\
  !*** ./libs/shared/src/index.ts ***!
  \**********************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./shared.module */ "./libs/shared/src/shared.module.ts"), exports);
__exportStar(__webpack_require__(/*! ./shared.service */ "./libs/shared/src/shared.service.ts"), exports);
__exportStar(__webpack_require__(/*! ./schemas/character.schema */ "./libs/shared/src/schemas/character.schema.ts"), exports);


/***/ },

/***/ "./libs/shared/src/schemas/character.schema.ts"
/*!*****************************************************!*\
  !*** ./libs/shared/src/schemas/character.schema.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharacterSchema = exports.Character = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let Character = class Character extends mongoose_2.Document {
};
exports.Character = Character;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", Number)
], Character.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Character.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Character.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Character.prototype, "species", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Character.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Character.prototype, "gender", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Character.prototype, "origin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Character.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Character.prototype, "image", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Character.prototype, "episode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Character.prototype, "url", void 0);
exports.Character = Character = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Character);
exports.CharacterSchema = mongoose_1.SchemaFactory.createForClass(Character);
exports.CharacterSchema.index({ name: 'text' });


/***/ },

/***/ "./libs/shared/src/shared.module.ts"
/*!******************************************!*\
  !*** ./libs/shared/src/shared.module.ts ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const shared_service_1 = __webpack_require__(/*! ./shared.service */ "./libs/shared/src/shared.service.ts");
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Module)({
        providers: [shared_service_1.SharedService],
        exports: [shared_service_1.SharedService],
    })
], SharedModule);


/***/ },

/***/ "./libs/shared/src/shared.service.ts"
/*!*******************************************!*\
  !*** ./libs/shared/src/shared.service.ts ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const redis_1 = __webpack_require__(/*! redis */ "redis");
let SharedService = class SharedService {
    async onModuleInit() {
        this.client = (0, redis_1.createClient)({
            url: 'redis://localhost:6379',
        });
        try {
            await this.client.connect();
        }
        catch (error) {
        }
    }
    async addTimeSeriesEntry(key, value) {
        if (!this.client?.isOpen)
            return;
        try {
            await this.client.sendCommand(['TS.ADD', key, '*', value.toString()]);
        }
        catch (error) {
            if (error.message?.includes('ERR TSDB: key does not exist')) {
                await this.client.sendCommand(['TS.CREATE', key]);
                await this.client.sendCommand(['TS.ADD', key, '*', value.toString()]);
            }
        }
    }
    async onModuleDestroy() {
        if (this.client?.isOpen) {
            await this.client.disconnect();
        }
    }
};
exports.SharedService = SharedService;
exports.SharedService = SharedService = __decorate([
    (0, common_1.Injectable)()
], SharedService);


/***/ },

/***/ "@nestjs/common"
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
(module) {

module.exports = require("@nestjs/common");

/***/ },

/***/ "@nestjs/core"
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
(module) {

module.exports = require("@nestjs/core");

/***/ },

/***/ "@nestjs/mongoose"
/*!***********************************!*\
  !*** external "@nestjs/mongoose" ***!
  \***********************************/
(module) {

module.exports = require("@nestjs/mongoose");

/***/ },

/***/ "@nestjs/swagger"
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
(module) {

module.exports = require("@nestjs/swagger");

/***/ },

/***/ "JSONStream"
/*!*****************************!*\
  !*** external "JSONStream" ***!
  \*****************************/
(module) {

module.exports = require("JSONStream");

/***/ },

/***/ "axios"
/*!************************!*\
  !*** external "axios" ***!
  \************************/
(module) {

module.exports = require("axios");

/***/ },

/***/ "mongoose"
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
(module) {

module.exports = require("mongoose");

/***/ },

/***/ "redis"
/*!************************!*\
  !*** external "redis" ***!
  \************************/
(module) {

module.exports = require("redis");

/***/ },

/***/ "stream/promises"
/*!**********************************!*\
  !*** external "stream/promises" ***!
  \**********************************/
(module) {

module.exports = require("stream/promises");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*******************************!*\
  !*** ./apps/main/src/main.ts ***!
  \*******************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/main/src/app.module.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Lumana API - Service A')
        .setDescription('The character API description')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(3000);
}
bootstrap();

})();

/******/ })()
;