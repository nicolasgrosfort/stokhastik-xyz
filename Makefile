.PHONY: convert install-tools

install-tools:
	cd tools/scripts && python -m pip install -r requirements.txt

convert:
	cd tools/scripts && \
	python convert.py ../../data/conversions/gaussians --output-dir ../../data/conversions/models && \
	python rotate.py ../../data/conversions/models --output-dir ../../data/conversions/models -x 180 && \
	python decimate.py ../../data/conversions/models --output-dir ../../data/conversions/models --ratio 1
