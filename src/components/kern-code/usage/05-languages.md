# PowerShell, Ruby and Go

`language="powershell"` (or `ps1`, `pwsh`) highlights cmdlets such as `Get-ChildItem`, `$variables`, operators like `-eq` and here-strings. `ruby` (`rb`) knows symbols, `@instance` variables and heredocs, `go` (`golang`) raw strings, runes and the predeclared types and functions.

```html
<div style="display:grid;gap:16px">
  <kern-code language="powershell" heading="Restart-Shelly.ps1" line-numbers>
    <# Turn a Shelly relay off and on again, e.g. to restart a frozen access point #>
    param([string]$Ip = $env:SHELLY_IP, [int]$Delay = 5)

    $status = Invoke-RestMethod -Uri "http://$Ip/rpc/Switch.GetStatus?id=0" -TimeoutSec 3
    if ($status.output -eq $true) {
        $body = @"
    {"id": 0, "on": false, "toggle_after": $Delay}
    "@
        Invoke-RestMethod -Method Post -Uri "http://$Ip/rpc/Switch.Set" -Body $body -ContentType 'application/json'
        Write-Host "Relay off, back on in $Delay s" -ForegroundColor Yellow
    }
  </kern-code>
  <kern-code language="ruby" heading="power_report.rb">
    require 'net/http'
    require 'json'

    DEVICES = { kitchen: '192.168.1.34', bathroom_fan: '192.168.1.21' }.freeze

    DEVICES.each do |name, ip|
      res = Net::HTTP.get(URI("http://#{ip}/rpc/Switch.GetStatus?id=0"))
      watts = JSON.parse(res, symbolize_names: true)[:apower]
      puts format('%-14s %6.1f W', name, watts)
    rescue Errno::EHOSTUNREACH, Net::OpenTimeout
      warn "#{name}: offline"
    end
  </kern-code>
  <kern-code language="go" heading="shelly.go">
    // Status reads the relay state of a Shelly Gen2 device.
    func Status(ctx context.Context, ip string) (bool, error) {
    	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
    	defer cancel()
    	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "http://"+ip+"/rpc/Switch.GetStatus?id=0", nil)
    	if err != nil {
    		return false, err
    	}
    	res, err := http.DefaultClient.Do(req)
    	if err != nil {
    		return false, fmt.Errorf("shelly %s: %w", ip, err)
    	}
    	defer res.Body.Close()
    	var s struct {
    		Output bool    `json:"output"`
    		Power  float64 `json:"apower"`
    	}
    	if err := json.NewDecoder(res.Body).Decode(&s); err != nil {
    		return false, err
    	}
    	return s.Output, nil
    }
  </kern-code>
</div>
```
