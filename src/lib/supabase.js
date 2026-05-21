import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rsmmqrkvevqptkwwwmey.supabase.co"
const supabaseAnonKey = "sb_publishable__xVnU5nX6AGzl16Rcf9Uyw_n51nyC1r"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)