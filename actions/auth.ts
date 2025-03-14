import bcrypt from 'bcryptjs'

export const login = async (formData: FormData) => {
    const email = formData.get('email')
    const password = formData.get('password')
    
    
}

export const createAccount = async (formData: FormData) => {
    const email = formData.get('email')
    const password = formData.get('password') as string
    const hashedPassword = bcrypt.hash(password, bcrypt.genSaltSync())
    const firstName = formData.get('first-name')
    const lastName = formData.get('last-name')

}