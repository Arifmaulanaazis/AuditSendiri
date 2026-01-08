package domain

type AppSettings struct {
	RTName       string `json:"rt_name"`
	RWName       string `json:"rw_name"`
	Kelurahan    string `json:"kelurahan"`
	Kecamatan    string `json:"kecamatan"`
	Address      string `json:"address"`
}
