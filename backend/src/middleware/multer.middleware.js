import multer from 'multer'
import path from "path"

const storage = multer.diskStorage({
    destination : function(req,res,cb){
        cd(null,'../../public/tempUserAvatar')
    },
    filename : function (req,res,cb) {
        const exe= path.extname(path.originalname)
        cb(null,`${File.fieldname}-${Date.now}.${ext}`)
    }
})

export const upload = multer({storage:storage})