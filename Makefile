VERSION = $(shell cat VERSION)
REGISTRY_HOST = docker-registry.intra.poltsi.fi

docker_kontti:
	docker build -t kontti-frontend:$(VERSION) -f Dockerfile-kontti .
	docker tag kontti-frontend:$(VERSION) $(REGISTRY_HOST)/kontti-frontend:$(VERSION)
	docker tag kontti-frontend:$(VERSION) $(REGISTRY_HOST)/kontti-frontend:latest
	docker push $(REGISTRY_HOST)/kontti-frontend:$(VERSION)
	docker push $(REGISTRY_HOST)/kontti-frontend:latest
