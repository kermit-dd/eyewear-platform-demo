/** @typedef {{ tenantId: string, storeId: string, name: string, subtitle: string, themeColor: string, phone: string }} TenantConfig */
/** @typedef {{ kind: 'svg'|'glb', url: string, scale: number, offsetX: number, offsetY: number, rotation: number }} TryOnAsset */
/** @typedef {{ skuId: string, tenantId: string, productId: string, name: string, style: string, price: number, lensWidth: number, bridgeWidth: number, lensHeight: number, templeLength: number, frameWidth: number, fitTags: string[], imageUrl: string, tryOnAsset?: TryOnAsset }} FrameSku */
/** @typedef {{ tenantId: string, style?: string, maxPrice?: number, minFrameWidth?: number, maxFrameWidth?: number }} CatalogFilter */
/** @typedef {{ level: 'recommended'|'tight'|'wide'|'unknown', label: string, score: number }} FitResult */
/** @typedef {{ sphere: string, pd: string, cylinder: string, axis: string }} PrescriptionEye */
/** @typedef {{ hasAstigmatism: boolean, reportFileName?: string, right: PrescriptionEye, left: PrescriptionEye }} Prescription */
/** @typedef {{ leadId: string, tenantId: string, skuId: string, name: string, phone: string, note: string, prescription: Prescription, createdAt: string }} Lead */

export {};
