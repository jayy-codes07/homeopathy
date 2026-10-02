import multer from 'multer'
import path from "path"

const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/tempUserAvatar')
    },
    filename : function (req,file,cb) {
        // extname already includes the leading dot.
        const ext = path.extname(file.originalname)
        cb(null,`${file.fieldname}-${Date.now()}${ext}`)
    }
})

export const upload = multer({storage:storage})