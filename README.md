# pe-lab
 "Production-like IDP on local k8s" — fictional startup `Acme Corp` with real-world patterns.



**Repo structure:**

```
pe-lab/
├── README.md              # main — with architecture diagram
├── docs/                  # TechDocs compatible format
├── terraform/
│   └── bootstrap/         # Kind + ArgoCD initial setup
├── kubernetes/
│   ├── argocd/            # App-of-apps
│   ├── backstage/         # HelmRelease + values
│   ├── kyverno/           # ClusterPolicies
│   ├── crossplane/        # Compositions + Claims
│   └── monitoring/        # kube-prometheus-stack values
├── backstage/
│   ├── app-config.yaml
│   └── catalog/           # catalog-info.yaml for fictional services
└── scripts/
    └── setup.sh           # one-command local bootstrap
```


