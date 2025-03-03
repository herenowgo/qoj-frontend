/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseFilePreviewDTO } from '../models/BaseResponseFilePreviewDTO';
import type { BaseResponseListFileListVO } from '../models/BaseResponseListFileListVO';
import type { BaseResponseListStudyResourceVO } from '../models/BaseResponseListStudyResourceVO';
import type { BaseResponseMapStringLong } from '../models/BaseResponseMapStringLong';
import type { BaseResponseString } from '../models/BaseResponseString';
import type { BaseResponseStudyResourceVO } from '../models/BaseResponseStudyResourceVO';
import type { BaseResponseVoid } from '../models/BaseResponseVoid';
import type { StudyResourceRequest } from '../models/StudyResourceRequest';
import type { UpdateStudyResourceRequest } from '../models/UpdateStudyResourceRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class StudyResourceControllerService {

    /**
     * 更新学习资源
     * 更新学习资源的基本信息
     * @param requestBody
     * @returns BaseResponseVoid OK
     * @throws ApiError
     */
    public static updateResource(
        requestBody: UpdateStudyResourceRequest,
    ): CancelablePromise<BaseResponseVoid> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/resource',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * 创建非文档类型学习资源
     * 创建不需要上传文件的学习资源，如文章、笔记、在线资源等
     * @param requestBody
     * @returns BaseResponseStudyResourceVO OK
     * @throws ApiError
     */
    public static createResource(
        requestBody: StudyResourceRequest,
    ): CancelablePromise<BaseResponseStudyResourceVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/resource',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * 设置资源公开状态
     * 设置资源是否公开，仅管理员可操作
     * @param id 资源ID
     * @param isPublic 是否公开
     * @returns BaseResponseVoid OK
     * @throws ApiError
     */
    public static setResourcePublicStatus(
        id: string,
        isPublic: boolean,
    ): CancelablePromise<BaseResponseVoid> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/resource/{id}/public',
            path: {
                'id': id,
            },
            query: {
                'isPublic': isPublic,
            },
        });
    }

    /**
     * 上传文件
     * 上传文件到指定目录，支持大小限制和文件类型校验
     * @param formData
     * @returns BaseResponseString OK
     * @throws ApiError
     */
    public static uploadFile(
        formData?: {
            /**
             * 文件
             */
            file: Blob;
        },
    ): CancelablePromise<BaseResponseString> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/resource/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * 收藏公开资源
     * 将公开资源收藏到用户个人空间
     * @param id 资源ID
     * @param targetPath 目标路径
     * @returns BaseResponseStudyResourceVO OK
     * @throws ApiError
     */
    public static favoritePublicResource(
        id: string,
        targetPath: string = '/',
    ): CancelablePromise<BaseResponseStudyResourceVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/resource/public/{id}/favorite',
            path: {
                'id': id,
            },
            query: {
                'targetPath': targetPath,
            },
        });
    }

    /**
     * 创建文件夹
     * 在指定目录下创建新文件夹，同名文件夹不允许创建
     * @param name 文件夹名称
     * @param parentPath 父目录路径
     * @returns BaseResponseVoid OK
     * @throws ApiError
     */
    public static createFolder(
        name: string,
        parentPath: string = '/',
    ): CancelablePromise<BaseResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/resource/folder',
            query: {
                'name': name,
                'parentPath': parentPath,
            },
        });
    }

    /**
     * 上传资源封面
     * 上传资源封面图片，返回永久访问URL，支持jpg、png、jpeg格式
     * @param formData
     * @returns BaseResponseString OK
     * @throws ApiError
     */
    public static uploadCover(
        formData?: {
            /**
             * 封面图片文件
             */
            file: Blob;
        },
    ): CancelablePromise<BaseResponseString> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/resource/cover',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * 获取资源详情
     * 根据资源ID获取资源的详细信息
     * @param id 资源ID
     * @returns BaseResponseStudyResourceVO OK
     * @throws ApiError
     */
    public static getResourceDetail(
        id: string,
    ): CancelablePromise<BaseResponseStudyResourceVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/resource/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * 删除文件/文件夹
     * 删除指定ID的文件或文件夹，文件夹会递归删除其下所有内容
     * @param id 资源ID
     * @returns BaseResponseVoid OK
     * @throws ApiError
     */
    public static delete(
        id: string,
    ): CancelablePromise<BaseResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/resource/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * 获取存储空间统计
     * 获取当前用户的存储空间使用情况，包括已用空间和总空间
     * @returns BaseResponseMapStringLong OK
     * @throws ApiError
     */
    public static getStorageStats(): CancelablePromise<BaseResponseMapStringLong> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/resource/storage/stats',
        });
    }

    /**
     * 获取所有公开资源
     * 获取所有被设置为公开的资源列表
     * @returns BaseResponseListStudyResourceVO OK
     * @throws ApiError
     */
    public static getPublicResources(): CancelablePromise<BaseResponseListStudyResourceVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/resource/public',
        });
    }

    /**
     * 获取公开资源详情
     * 通过ID获取指定的公开资源详情
     * @param id 资源ID
     * @returns BaseResponseStudyResourceVO OK
     * @throws ApiError
     */
    public static getPublicResourceDetail(
        id: string,
    ): CancelablePromise<BaseResponseStudyResourceVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/resource/public/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * 预览文件
     * 获取文件的预览信息，支持文本、图片、PDF等格式，返回对应的预览URL或内容
     * @param id 资源ID
     * @returns BaseResponseFilePreviewDTO OK
     * @throws ApiError
     */
    public static previewFile(
        id: string,
    ): CancelablePromise<BaseResponseFilePreviewDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/resource/preview/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * 获取文件列表
     * 获取指定目录下的文件和文件夹列表，只返回名称和类型信息
     * @param path 目录路径
     * @returns BaseResponseListFileListVO OK
     * @throws ApiError
     */
    public static listFiles(
        path: string = '/',
    ): CancelablePromise<BaseResponseListFileListVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/resource/list',
            query: {
                'path': path,
            },
        });
    }

}
