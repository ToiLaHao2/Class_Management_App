/**
 * API Response Formatter
 * Giup toan bo ung dung tra ve JSON cung 1 format chuan nhat.
 */
class ApiResponse {
    /**
     * Tra ve du lieu thanh cong (200, 201)
     * @param {Object} res - Express response object
     * @param {Object} data - Du lieu gui ve client
     * @param {string} message - (Optional) Thong bao
     * @param {number} statusCode - HTTP Status (Mac dinh: 200)
     */
    static success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            meta: {
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Tra ve phan trang (Pagination)
     */
    static paginate(res, data, paginationMeta, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                pagination: paginationMeta
            }
        });
    }
}

module.exports = ApiResponse;
