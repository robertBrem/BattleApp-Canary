#!/usr/bin/jjs -fv

var FileWriter = Java.type("java.io.FileWriter");

var version = $ENV.VERSION;
var kubectl = $ENV.KUBECTL;

var name = "battleapp";
var nameWithVersion = name + "-" + version;
var image = "disruptor.ninja:30500/robertbrem/battleapp:" + version;
var replicas = 1;
var port = 8080;
var clusterPort = 8880;
var nodePort = 30080;
var deploymentFileName = "deployment.yml";
var serviceFileName = "service.yml";
var registrysecret = "registrykey";
var url = "http://disruptor.ninja:" + nodePort + "/battleapp/resources/users";
var timeout = 2;

var dfw = new FileWriter(deploymentFileName);
dfw.write("apiVersion: extensions/v1beta1\n");
dfw.write("kind: Deployment\n");
dfw.write("metadata:\n");
dfw.write("  name: " + nameWithVersion + "\n");
dfw.write("spec:\n");
dfw.write("  replicas: " + replicas + "\n");
dfw.write("  template:\n");
dfw.write("    metadata:\n");
dfw.write("      labels:\n");
dfw.write("        name: " + name + "\n");
dfw.write("        version: " + version + "\n");
dfw.write("    spec:\n");
dfw.write("      containers:\n");
dfw.write("      - resources:\n");
dfw.write("        name: " + name + "\n");
dfw.write("        image: " + image + "\n");
dfw.write("        ports:\n");
dfw.write("        - name: port\n");
dfw.write("          containerPort: " + port + "\n");
dfw.write("      imagePullSecrets:\n");
dfw.write("      - name: " + registrysecret + "\n");
dfw.close();

var deploy = kubectl + " create -f " + deploymentFileName;
execute(deploy);

var sfw = new FileWriter(serviceFileName);
sfw.write("apiVersion: v1\n");
sfw.write("kind: Service\n");
sfw.write("metadata:\n");
sfw.write("  name: " + name + "\n");
sfw.write("  labels:\n");
sfw.write("    name: " + name + "\n");
sfw.write("spec:\n");
sfw.write("  ports:\n");
sfw.write("  - port: " + clusterPort + "\n");
sfw.write("    targetPort: " + port + "\n");
sfw.write("    nodePort: " + nodePort + "\n");
sfw.write("  selector:\n");
sfw.write("    name: " + name + "\n");
sfw.write("  type: NodePort\n");
sfw.close();

var deployService = kubectl + " create -f " + serviceFileName;
execute(deployService);

var testUrl = "curl --write-out %{http_code} --silent --output /dev/null " + url + " --max-time " + timeout;
execute(testUrl);
while ($OUT != "200") {
    $EXEC("sleep 1");
    execute(testUrl);
}

function execute(command) {
    $EXEC(command);
    print($OUT);
    print($ERR);
}