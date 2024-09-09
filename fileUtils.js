const fs = require('fs').promises;

/**
 * อ่านเนื้อหาของไฟล์
 * @param {string} filePath - เส้นทางของไฟล์
 * @returns {Promise<string>} - เนื้อหาของไฟล์
 */
async function readFileContent(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        throw new Error('Error reading file: ${error.message}');
    }
}

module.exports = { readFileContent };